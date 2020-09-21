import {Canban} from './app'
import {varFunc} from './typesUtil'
type readCommandRetun = boolean | varFunc

export function readCommand(command: string): readCommandRetun{
    let result

    switch(command){
        case 'clear':
            result = function(canban: Canban, ...args: any[]){
                canban.tasks = [[], [], [], []]
                canban.saveState()
                canban.render()
            }
            break;
        default: 
            result = false
            break;
    }

    return result 
}















