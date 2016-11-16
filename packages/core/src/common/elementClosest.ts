/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the Apache License, Version 2.0 - http://www.apache.org/licenses/LICENSE-2.0
 *
 * This code based on github.com/jonathantneal/closest, licensed under CC0-1.0.
 * Modified from (to leverage typescript):
 * https://github.com/jonathantneal/closest/blob/0fa4efdef0a5fca5684f53f2e4f8b64c4c65ff44/element-closest.js
 */

// tslint:disable:no-invalid-this

(function (ElementProto) {
    if (typeof ElementProto.matches !== "function") {
        ElementProto.matches = ElementProto.msMatchesSelector
            || ElementProto.webkitMatchesSelector
            || (ElementProto as any).mozMatchesSelector
            || function matches(this: Element, selector: string) {
                const element = this;
                const thisDocument: Document = ((element as any).document || element.ownerDocument);
                const elements = thisDocument.querySelectorAll(selector);

                let index = 0;
                while (elements[index] && elements[index] !== element) {
                    ++index;
                }

                return Boolean(elements[index]);
            };
    }

    if (typeof ElementProto.closest !== "function") {
        ElementProto.closest = function closest(this: Element, selector: string) {
            let element = this;

            while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                    return element;
                }

                element = element.parentElement;
            }

            return null;
        };
    }
})(Element.prototype);
