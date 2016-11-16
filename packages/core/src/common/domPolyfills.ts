/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0
 */

// http://stackoverflow.com/a/24107550/6342931

if (Element.prototype.matches == null) {
    let matchesFn: typeof Element.prototype.matches;
    ["webkitMatchesSelector", "mozMatchesSelector", "msMatchesSelector", "oMatchesSelector"].forEach((fn) => {
        if (typeof (document.body as any)[fn] === "function") {
            matchesFn = (document.body as any)[fn];
        }
    });
    Element.prototype.matches = matchesFn;
}

if (Element.prototype.closest == null) {
    Element.prototype.closest = function (this: Element, selector: string) {
        // tslint:disable-next-line:no-invalid-this
        let el = this;
        while (el) {
            if (el.matches(selector)) {
                return el;
            }
            el = el.parentElement;
        }
        return undefined;
    };
}
