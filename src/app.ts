import './styles/app.scss'
import { createItemHTML, createNewItemHTML, trottle, createEmptyItemHTML } from './utils'
import { readCommand } from './cmd'
import { varFunc } from './typesUtil'

// types \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
interface ITask {
    date: number
    text: string
    id: number
}


// vars \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

const tasks: ITask[][] = [
    [
        {
            date: Date.now(),
            text: 'Сделать канбан',
            id: 1
        }
    ],
    [
        {
            date: Date.now(),
            text: 'Сделать канбан',
            id: 2
        }
    ],
    [
        {
            date: Date.now(),
            text: 'Сделать канбан',
            id: 3
        }
    ],
    [
        {
            date: Date.now(),
            text: 'Сделать канбан',
            id: 4
        }
    ]
]

const taskPanels: HTMLElement[] = Array.from(document.querySelectorAll('.column[data-taks]'))
let newItem: any = null
let editItem: any = null
let funcForEdit: any = null
let copyItem: null | HTMLElement = null
const deleteButton: HTMLElement = document.querySelector('.panel__delete') as HTMLElement
let emptyItem: null | HTMLElement = null
let prevItem: null | HTMLElement = null

let tempFuncs: any = {
    documentMouseUpHandler: null,
    documentMouseMoveHandler: null
}
// funcs \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
function clearActiveElement() {
    clearMarker()
    clearCopyItem()
}

function clearMarker() {
    if (emptyItem) {
        emptyItem.remove()
        emptyItem == null
    }
}

function clearCopyItem() {
    if (copyItem) {
        copyItem.remove()
        copyItem = null!
        document.removeEventListener('mouseup', tempFuncs.documentMouseUpHandler)
        document.removeEventListener('mousemove', tempFuncs.documentMouseMoveHandler)

        tempFuncs.documentMouseUpHandler = null
        tempFuncs.documentMouseMoveHandler = null
    }
}

function clearEditableItem() {
    clearEditItem()
    clearNewItem()
}

function clearNewItem() {
    if (newItem) {
        newItem.remove()
        newItem = null
    }
}

function clearEditItem() {
    if (editItem) {
        editItem.querySelector('.item__edit').removeEventListener('click', funcForEdit)
        editItem.querySelector('.item__input').outerHTML = `
            <span class="item__text">${editItem.dataset.prevstate}</span>
        `
        editItem.dataset.prevstate = ''

        editItem = null
    }
}




// code \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
export class Canban {
    public tasks: ITask[][] = [[], [], [], []]
    public idCounter: number = 1
    public taskPanels: HTMLElement[]

    constructor(taskPanels: HTMLElement[]) {
        this.initCanban()

        this.idCounter = Number(localStorage.getItem('idTasks')) || 1

        this.taskPanels = taskPanels
        this.render()
    }

    initCanban() {
        const tasksFromStorage = JSON.parse(localStorage.getItem('tasks') || '[[], [], [], []]')
        this.tasks = tasksFromStorage
    }

    saveState() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks))
        localStorage.setItem('idTasks', this.idCounter.toString())
    }

    createTask(taskStage: number, text: string) {
        this.tasks[taskStage].push({
            id: this.idCounter++,
            date: Date.now(),
            text
        })
        this.render()
    }

    render() {
        this.taskPanels.forEach(($el, i) => {
            let $content: HTMLElement = $el.querySelector('.column__content') as HTMLElement
            $content.innerHTML = ''

            for (const task of this.tasks[i]) {
                let formatDate = new Date(task.date)
                $content.insertAdjacentHTML('beforeend', createItemHTML(task.text, task.id, formatDate.toLocaleDateString('ru')))
            }
        })
    }

    findById(id: number) {
        for (const stage of this.tasks) {
            for (let i = 0; i < stage.length; i++) {
                if (stage[i].id === id) return stage[i]
            }
        }

        return null
    }

    editTask(text: string, id: number, taskStage?: number) {
        if (taskStage != undefined && taskStage != null) {
            this.tasks[taskStage].find(el => { return el.id === id })!.text = text;
        } else {
            let obj = this.findById(id)

            if (obj) {
                obj.text = text
            }
        }
    }

    deleteById(id: number) {
        for (let i = 0; i < this.tasks.length; i++) {

            for (let j = 0; j < this.tasks[i].length; j++) {
                if (this.tasks[i][j].id === id) {
                    this.tasks[i].splice(j, 1)
                    return this.render()
                }
            }

        }
    }

    appendTask(taskStage: number, taskStageItem: number, itemId: number) {
        const originalTaskIndex = this.tasks[taskStageItem].findIndex(t => t.id === itemId)
        this.tasks[taskStage].push(this.tasks[taskStageItem][originalTaskIndex])
        this.tasks[taskStageItem].splice(originalTaskIndex, 1)
        this.render()
    }

    changeTask(taskStage: number, idTarget: number, taskStageItem: number, idItem: number) {
        const originalTaskIndex = this.tasks[taskStageItem].findIndex(t => t.id === idItem)
        const targetTaskIndex = this.tasks[taskStage].findIndex(t => t.id === idTarget)
        let originalItem = this.tasks[taskStageItem][originalTaskIndex]
        this.tasks[taskStageItem].splice(originalTaskIndex, 1)
        this.tasks[taskStage].splice(targetTaskIndex, 0, originalItem)
        this.render()
    }

    exportState() {
        return JSON.stringify(this.tasks)
    }

    importState(newState: any[][]): boolean {
        let maxId = 1

        if (Array.isArray(newState)) {
            if (newState.length == 4) {

                for (let i = 0; i < newState.length; i++) {
                    if (!Array.isArray(newState[i])) {
                        return false
                    }

                    for (const task of newState[i]) {
                        if (!('id' in task)) {
                            return false
                        } else {
                            maxId = Math.max(maxId, task.id)
                        }
                        if (!('text' in task)) {
                            return false
                        }
                        if (!('date' in task)) {
                            return false
                        }
                    }
                }

                this.tasks = newState
                this.idCounter = maxId + 1
                this.saveState()
                this.render()
                return true
            }
        }

        return false
    }

}

const canban = new Canban(taskPanels)

// handlers \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.getElementById('saveBtn')!.addEventListener('click', (event: Event) => {
    canban.saveState()
})

// Поведение \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.addEventListener('click', (event: Event) => {
    let target: HTMLElement = event.target as HTMLElement

    // CREATE NEW ITEM
    if (target.dataset.new) {
        let column: HTMLElement = target.closest('.column[data-taks]') as HTMLElement

        if (newItem) {
            newItem.remove()
        }
        column.insertAdjacentHTML('beforeend', createNewItemHTML())
        newItem = column.lastElementChild;
        ((newItem as HTMLElement).querySelector('.item__input') as HTMLInputElement).focus()
    }

    // CREATE
    if (target.dataset.create) {
        let textInput: HTMLInputElement = target.previousElementSibling as HTMLInputElement
        let column: HTMLElement = target.closest('.column[data-taks]') as HTMLElement
        let text: string = textInput.value.trim()

        if (text.length > 5) {
            canban.createTask(Number(column.dataset.taks), text)
            newItem.remove()
            newItem = null


            console.log(canban);

        } else {
            textInput.classList.add('item__input--invalid')
        }
    }

    // EDIT
    if (target.dataset.edit) {
        clearEditableItem()

        let $text = target.previousElementSibling
        let text: string = String($text?.firstChild!.nodeValue)
        const item: HTMLElement = <HTMLElement>target.closest('.item')
        const itemId = item.dataset.itemId
        const column: HTMLElement = target.closest('.column[data-taks]') as HTMLElement
        const taskStage = Number(column.dataset.taks)
        editItem = item
        item.dataset.prevstate = text

        $text!.outerHTML = `
            <input type="text" class="item__input" value="${text}">
        `;

        const editItemHandle = (e: Event) => {
            let prevSiblingInput: HTMLInputElement = target.previousElementSibling as HTMLInputElement

            if(prevSiblingInput.tagName !== 'INPUT'){
                return
            }
            
            let text = prevSiblingInput.value.trim()

            if (text.length > 5) {
                target.previousElementSibling!.remove()
                target.insertAdjacentHTML('beforebegin', `<span data-drag="true" class="item__text">${text}</span>`)
                canban.editTask(text, Number(itemId), Number(taskStage))
                editItem = null
                funcForEdit = null
                item.dataset.isEdit = ''
                e.stopPropagation()
            } else {
                (target.previousElementSibling as HTMLInputElement).classList.add('item__input--invalid')
            }
        }

        funcForEdit = editItemHandle
        item.dataset.isEdit = 'true'

        target.addEventListener('click', editItemHandle, { once: true });

        (<HTMLElement>target.previousElementSibling).addEventListener('keydown', function (e: KeyboardEvent) {
            if (e.key == 'Enter') {
                e.stopPropagation()
                let text = (target.previousElementSibling as HTMLInputElement).value

                if (text.length > 5) {
                    target.previousElementSibling!.remove()
                    target.removeEventListener('click', editItem)
                    target.insertAdjacentHTML('beforebegin', `<span data-drag="true" class="item__text">${text}</span>`)
                    canban.editTask(text, Number(itemId), Number(taskStage))
                    editItem = null
                    funcForEdit = null
                    item.dataset.isEdit = ''
                } else {
                    (target.previousElementSibling as HTMLInputElement).classList.add('item__input--invalid')
                }
            }
        })
    } else if (editItem && !target.closest('.item')) { // Если кликнули по документу закрыть все редактирования
        clearEditItem()
    }

    if (!target.closest('.column')) {
        clearNewItem()
    }
})

// Drag'n drop \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
document.addEventListener('mousedown', (event: MouseEvent) => {
    if (event.which !== 1) {
        return
    }

    let target: HTMLElement = event.target as HTMLElement
    let dragElem: HTMLElement = target.closest('[data-drag]') as HTMLElement
    if (!dragElem) {
        return
    }

    let item: HTMLElement = dragElem.closest('.item') as HTMLElement
    if (item && !item.dataset.isEdit && !target.dataset.edit) {
        clearEditableItem()

        // Drag start
        copyItem = item.cloneNode(true) as HTMLElement
        copyItem.classList.add('item--copy')
        let elemCoords = item.getBoundingClientRect()
        const shiftX = event.clientX - elemCoords.left
        const shiftY = event.clientY - elemCoords.top
        let underElement: HTMLElement | null = null
        let underElementIsDeleteButton = false
        let prevLeft: number | null = null
        let currentRotateAngle: any = 0
        let angleTimer: any = null

        let prevAngleDiff = 0

        document.body.appendChild(copyItem)
        prevLeft = event.clientX - shiftX + 2
        copyItem.style.top = event.clientY - shiftY + 2 + 'px'
        copyItem.style.left = prevLeft + 'px'
        copyItem.style.width = item.offsetWidth + 'px'
        copyItem.style.transformOrigin = `${shiftX}px ${shiftY}px`

        // Angle timer
        angleTimer = setTimeout(function inner() {
            if (!copyItem) {
                return
            }
            let copyItemCoord = copyItem.getBoundingClientRect()
            let left = Math.round(copyItemCoord.left)

            let angleDiff = Math.round((Math.abs(prevLeft! - left) + prevAngleDiff) / 2)
            prevAngleDiff = angleDiff

            if (prevLeft! > left) {
                currentRotateAngle = Math.min(30, angleDiff)
                copyItem!.style.transform = `rotateZ(-${currentRotateAngle}deg)`
            } else if (prevLeft! < left) {

                currentRotateAngle = Math.min(30, angleDiff)
                copyItem!.style.transform = `rotateZ(${currentRotateAngle}deg)`
            } else {
                copyItem!.style.transform = ''
            }

            prevAngleDiff = angleDiff
            prevLeft = Math.round(left)
            angleTimer = setTimeout(inner, 60)
        }, 60)

        // moove
        let moove = (e: MouseEvent) => {
            // keep under element
            copyItem!.hidden = true
            underElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
            copyItem!.hidden = false

            if (underElement) {
                let tempColumn = underElement.closest('.column')
                let tempItem = underElement.closest('.item[data-item-id]')
                let tempUnderItem = underElement.closest('.item')
                

                if (tempItem && tempColumn && prevItem !== tempItem) {
                    if (tempItem !== item) {
                        if(emptyItem){
                            tempItem.before(emptyItem)
                        }else{
                            tempItem.insertAdjacentHTML('beforebegin', createEmptyItemHTML())
                            emptyItem = tempItem.previousElementSibling as HTMLElement
                        }
                    }else{
                        clearMarker()
                    }
                } else if (tempColumn) {
                    if (!tempUnderItem) {
                        let tempContent = tempColumn.querySelector('.column__content')

                        if(emptyItem){
                            tempContent!.append(emptyItem)
                        }else{
                            tempContent!.insertAdjacentHTML('beforeend', createEmptyItemHTML())
                            emptyItem = tempContent?.lastElementChild as HTMLElement
                        }
                    }
                } else {
                    clearMarker()
                }

                if (underElement.closest('.canban__panel')) {
                    deleteButton.classList.add('big')
                    underElementIsDeleteButton = true
                } else {
                    if (underElementIsDeleteButton) {
                        underElementIsDeleteButton = false
                        deleteButton.classList.remove('big')
                    }
                }
            }
            
            mooveAt(e)
        }

        const mooveAt = (e: MouseEvent) => {

            let left = e.clientX - shiftX
            let top = e.clientY - shiftY

            /* Ограничение вылета за экран */
            if (left < 0) {
                left = 0
            }

            if (top < 0) {
                top = 0
            }

            if (top + copyItem!.offsetHeight > document.documentElement.clientHeight) {
                top = document.documentElement.clientHeight - copyItem!.offsetHeight
            }

            if (left + copyItem!.offsetWidth > document.documentElement.clientWidth) {
                left = document.documentElement.clientWidth - copyItem!.offsetWidth
            }

            copyItem!.style.top = top + 'px'
            copyItem!.style.left = left + 'px'
        }

        const mouseUpHandler = (e: MouseEvent) => {
            let itemId = copyItem?.dataset.itemId
            copyItem!.remove()
            copyItem = null!

            clearTimeout(angleTimer)

            //? document.elementsFromPoint(X, Y) - позволяет получить все элементы в данной точки вплоть до HTML
            underElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement
            if(!underElement){
                clearMarker()
                document.removeEventListener('mousemove', moove)
                deleteButton.classList.remove('big')
                return
            }

            if (underElement == deleteButton) {
                canban.deleteById(Number(itemId))
            }
            deleteButton.classList.remove('big')

            let tempColumn: HTMLElement = underElement.closest('.column') as HTMLElement
            let tempItem: HTMLElement = underElement.closest('.item[data-item-id]') as HTMLElement
            let tempUnderItem: HTMLElement = underElement.closest('.item') as HTMLElement
            let originalColumn: HTMLElement | null = item.closest('.column')

            if (tempItem && tempColumn && tempItem !== item) {
                canban.changeTask(Number(tempColumn.dataset.taks), Number(tempItem.dataset.itemId), Number(originalColumn?.dataset.taks), Number(item.dataset.itemId))
            } else if (tempColumn && tempUnderItem) {
                let siblingItem: HTMLElement = <HTMLElement>tempUnderItem.nextElementSibling
                if (siblingItem && tempUnderItem !== item) {
                    canban.changeTask(Number(tempColumn.dataset.taks), Number(siblingItem.dataset!.itemId), Number(originalColumn?.dataset.taks), Number(item.dataset.itemId))
                } else if (tempItem) {
                    if (tempItem !== item) {
                        canban.appendTask(Number(tempColumn.dataset.taks), Number(originalColumn?.dataset.taks), Number(item.dataset.itemId))
                    }
                } else {
                    canban.appendTask(Number(tempColumn.dataset.taks), Number(originalColumn?.dataset.taks), Number(item.dataset.itemId))
                }
            } else if (tempColumn) {
                canban.appendTask(Number(tempColumn.dataset.taks), Number(originalColumn?.dataset.taks), Number(item.dataset.itemId))
            }

            // Убрать маркер
            clearMarker()

            document.removeEventListener('mousemove', moove)
        }

        document.addEventListener('mousemove', moove)
        document.addEventListener('mouseup', mouseUpHandler, { once: true, passive: true })

        tempFuncs.documentMouseMoveHandler = moove
        tempFuncs.documentMouseUpHandler = mouseUpHandler

        event.preventDefault()
    }
})

let commandString: string = ''

// Keydown \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ 
document.body.addEventListener('keydown', (event: KeyboardEvent) => {

    /* Если нажали Enter определяем, если нажали в input-у создания, то создаём новый элемент */
    let target: HTMLInputElement = event.target as HTMLInputElement
    if (event.key === 'Enter' && target && target.classList.contains('item__input')) {
        let text = target.value.trim()
        let column: HTMLElement = target.closest('.column') as HTMLElement

        if (text.length > 5) {
            canban.createTask(Number(column.dataset.taks), text)
            newItem.remove()
            newItem = null
        } else {
            target.classList.add('item__input--invalid')
        }
    }

    // author
    /* Если человек введёт через альт author то откроется окно кто сделал */
    /* Если ввести cmd с зажатыми alt ctrl появится окно комманд */
    if ((event.metaKey || event.ctrlKey) && event.altKey) {
        if (event.key === 'Alt' || event.key === 'Ctrl') {
            return
        }

        commandString += event.key
        if (commandString.length >= 3) {
            if (commandString === 'cmd') {
                let functionForExecute = readCommand(String(prompt('Введите команду...')))
                if (functionForExecute) {
                    (<varFunc>functionForExecute)(canban)
                } else {
                    alert("Нет такой команды...")
                }
            }
            commandString = ''
        }

    } else if (event.altKey) {
        if (event.key === 'Alt') {
            return
        }
        commandString += event.key
        if (commandString.length >= 6) {
            if (commandString === 'author') {
                alert('Барабанщиков Иван Николаевич<QwiniTRON>')
            }
            commandString = ''
        }
    } else {
        commandString = ''
    }
})

// export Btn \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
const exportBtn: HTMLElement = document.querySelector('#exportBtn') as HTMLElement
const importBtn: HTMLElement = document.querySelector('#importBtn') as HTMLElement
exportBtn.addEventListener('click', (event: MouseEvent) => {
    navigator.clipboard.writeText(canban.exportState()).then(() => {
        alert('Скопированно в буфер обмена...')
    }, (err) => { })
})

// import Btn \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
importBtn.addEventListener('click', (event: MouseEvent) => {
    let state: any = prompt('Внесите состояние')
    let newState: any[][]

    try {
        newState = JSON.parse(state) as any[][]
        if (!canban.importState(newState)) {
            alert('Некорректные данные...')
        }
    } catch (err) {
        alert('Некорректные данные...')
    }
})

// TODO
// • Даты и если дата подходит то подчеркунуть*

// ? window.innerWidth - ширина вместе с полосой прокрутки
// ? document.documentElement.clientWidth - ширина без прокрутки 
// ? ширина полосы прокрутки = window.innerWidth - document.documentElement.clientWidth

// Уход со страницы \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
/*
    Если страницу свернули или кликнули правой кнопкой то происходит очистка поля от Drag'n Drop
*/
document.addEventListener('blur', () => {
    clearActiveElement()
})

window.addEventListener('beforeunload', (e: Event) => {
    canban.saveState()
})

window.addEventListener('blur', () => {
    clearActiveElement()
})



































































