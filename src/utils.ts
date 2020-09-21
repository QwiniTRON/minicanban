export function createItemHTML(text: string, id: number, date: string): string {
    return `
    <div class="item" data-item-id="${id}">
        <div class="item__content">
            <div class="item__date">${date}</div>
            <span class="item__text" data-drag="true">${text}</span>
            <div class="item__edit" data-edit="true">✎</div>
        </div>
    </div>
    `
}

export function createNewItemHTML() {
    return `
    <div class="item">
        <div class="item__content">
            <input type="text" class="item__input">
            <div class="item__edit" data-create="true">✓</div>
        </div>
    </div>
    `
}

export function createEmptyItemHTML() {
    return `
    <div class="item item--marker" data-marker="true">
        <div class="item__content item__content--empty"></div>
    </div>
    `
}



// trottle
export function trottle(fn: (...args: any[]) => any, ms: number) {
    let isTrottle = false
    let timer: any = null
    let savedArgs: any
    let savedThis: any

    return function (this: any, ...args: any[]) {
        if (isTrottle) {
            savedArgs = args
            savedThis = this
        } else {
            fn.apply(this, args)
            isTrottle = true
            timer = setTimeout(() => {
                isTrottle = false

                if (savedArgs) {
                    fn.apply(savedThis, savedArgs)
                    savedArgs = null
                    savedThis = null
                }
            }, ms)
        }
    }
}








