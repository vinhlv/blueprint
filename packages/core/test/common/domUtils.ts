/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0
 */

export function query<T extends HTMLElement>(element: NodeSelector, selector: string) {
    return element.querySelector(selector) as T;
}

export function queryAll<T extends HTMLElement>(element: NodeSelector, selector: string) {
    const nodeList = element.querySelectorAll(selector);
    const nodeArray: T[] = []; // empty at first
    for (let i = 0; i < nodeList.length; i++) {
        nodeArray.push(nodeList[i] as T);
    }
    return nodeArray;
}

function classSelector(classNames: string | string[]) {
    let classNamesArray = typeof classNames === "string" ? [classNames] : classNames;
    return classNamesArray.map((clz) => `.${clz}`).join("");
}

export function queryClass<T extends HTMLElement>(element: NodeSelector, classNames: string | string[]) {
    return query<T>(element, classSelector(classNames));
}

export function queryClassAll<T extends HTMLElement>(element: NodeSelector, classNames: string | string[]) {
    return queryAll<T>(element, classSelector(classNames));
}
