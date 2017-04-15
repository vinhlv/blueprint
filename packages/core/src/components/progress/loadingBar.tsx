/*
 * @license Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 */

/**
 * @fileoverview The LoadingBar component does not rely on the React lifecycle to animate changes. Because calls to
 * setState and render are queued in the event loop so that React can occasionally batch multiple calls together,
 * relying on these functions can result in slight but noticeable lag between the time when an event to update progress
 * is fired and the time when the loading bar actually moves. Directly modifying the class list and the transform CSS
 * property in the event handler allows us to make all necessary changes and forcibly layout / reflow (see note above
 * forceRedraw) as soon the event is received.
 */

import * as React from "react";

export interface ILoadingBarState {
    id: number;
    percentage: number;
};

// public for testing
export const LoadingBarClasses = {
    HIDDEN: "ws-loading-bar-hidden",
    NO_TRANSITION: "ws-loading-bar-no-transition",
    SLOW_TRANSITION: "ws-loading-bar-slow-transition",
};

interface ISetLoadingBarPercentageEvent {
    id: number;
    percentage: number;
    slow?: boolean;
}
function createSetLoadingBarPercentageEvent(id: number, percentage: number, slow = true) {
    return { id, percentage, slow } as ISetLoadingBarPercentageEvent;
}

export class LoadingBar extends React.Component<{}, ILoadingBarState> {
    public state = {
        id: 0,
        percentage: 0,
    };

    private loadId = 0;
    private loadingBar: HTMLDivElement;
    private loadingBarClassList: DOMTokenList;
    private refHandlers = {
        loadingBar: (ref: HTMLDivElement) => {
            this.loadingBar = ref;

            // HACKHACK: conditionally set to null to appease enzyme during ref detachment
            this.loadingBarClassList = ref != null ? ref.classList : null;
        },
    };

    public componentDidMount() {
        // initialize position to offscreen
        this.loadingBar.style.transform = "translateX(-100%)";
    }

    public shouldComponentUpdate() {
        // LoadingBar#handleSetPercentage and LoadingBar#beginFakeLoading are responsible for controlling animations
        return false;
    }

    public render() {
        return <div className={"ws-loading-bar"} ref={this.refHandlers.loadingBar} />;
    }

    public setLoadingBarPercentage(percentage: number) {
        if (percentage < 0 || 100 < percentage) {
            console.warn(`LoadingBar: cannot set progress to ${percentage}%, percentage must be between 0% and 100%.`);
            return;
        }
        const event = createSetLoadingBarPercentageEvent(this.loadId + 1, percentage, percentage !== 100);
        if (percentage === 100) {
            this.loadId += 1;
        }
        this.handleSetPercentage(event);
    }

    public bindLoadingBarToPromises<T>(promises: Array<Promise<T>>) {
        // todo: try reconciling increment behavior with manual set % function
        this.loadId += 1;
        const beginEvent = createSetLoadingBarPercentageEvent(this.loadId, 85);
        const endEvent = createSetLoadingBarPercentageEvent(this.loadId, 100, false);
        this.handleSetPercentage(beginEvent);
        return Promise.all<T>(promises)
            .then(() => this.handleSetPercentage(endEvent))
            .catch(() => this.handleSetPercentage(endEvent));
    }

    /**
     * non-fat-arrow event handler, public, and callback for testing
     * @internal
     */
    public handleSetPercentage(event: ISetLoadingBarPercentageEvent, testFunction?: () => void) {
        this.setState((previousState) => {
            const { id: currentId, percentage: currentPercentage } = previousState;
            const { id, percentage, slow } = event;

            if (id < currentId || (id === currentId && percentage < currentPercentage)) {
                return previousState;
            }

            // restart animation from 0%
            if (id > currentId) {
                this.reset();
            }

            if (slow) {
                this.loadingBarClassList.add(LoadingBarClasses.SLOW_TRANSITION);
            } else {
                this.loadingBarClassList.remove(LoadingBarClasses.SLOW_TRANSITION);
            }

            this.loadingBar.style.transform = `translateX(-${100 - percentage}%)`;
            this.forceRedraw();

            // hide after loading complete
            if (percentage === 100) {
                this.loadingBarClassList.remove(LoadingBarClasses.SLOW_TRANSITION);
                this.loadingBarClassList.add(LoadingBarClasses.HIDDEN);
                this.forceRedraw();
            }

            return {
                id,
                percentage,
            };
        }, () => {
            if (testFunction) {
                testFunction();
            }
        });
    };

    private reset = () => {
        this.loadingBarClassList.remove(LoadingBarClasses.SLOW_TRANSITION);
        this.loadingBarClassList.add(LoadingBarClasses.NO_TRANSITION);
        this.loadingBar.style.transform = "translateX(-100%)";
        this.forceRedraw();
        this.loadingBarClassList.remove(LoadingBarClasses.NO_TRANSITION, LoadingBarClasses.HIDDEN);
    }

    // accessing an element's offsetHeight forces the browser to synchronously recalculate styles. necessary to prevent
    // browser batching style changes, effectively skipping certain CSS changes. This process is known as "Layout" in
    // most browsers and "Reflow" in firefox.
    private forceRedraw = () => {
        return this.loadingBar.offsetHeight;
    }
}
