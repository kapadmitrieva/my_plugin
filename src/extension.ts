import * as vscode from 'vscode';

//Функция, запускаемая при первом нажатии на кнопку плагина
export function activate(context: vscode.ExtensionContext) {
    console.log('Плагин запущен');
    
    //Регистрация команды
    let dispos = vscode.commands.registerCommand('OperationAnnotator.annotateCode', () => {
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        //Просмотр выделенного и поиск в нем текста
        const selection: vscode.Selection = editor.selection;
        const text: string = editor.document.getText(selection);

        if (!text) {
            vscode.window.showWarningMessage('Выделите текст для анализа');
            return;
        }

        //Разделение текста на отдельные строки (чтобы проверять их по очереди)
        const lines: string[] = text.split('\n');
        const processedLines: string[] = [];

        //Счетчик количества операций
        let operCount = 0;

        for (let line of lines) {
            let comment: string = '';
            let found = false;
            let operName = '';

            //Поиск ключевых слов
            if (/\bif\b/.test(line)) {
                comment = ' // Найдено условие IF';
                found = true;
            } else if (/\bfor\b/.test(line)) {
                comment = ' // Найден цикл FOR';
                found = true;
            } else if (/\bwhile\b/.test(line)) {
                comment = ' // Найден цикл WHILE';
                found = true;
            } else if (/\bswitch\b/.test(line)) {
                comment = ' // Найден переключатель SWITCH';
                found = true;
            }

            if (found) {
                operCount++;
            }

            processedLines.push(line.replace(/\r$/, '') + comment);
        }

        //Сборка в единый текст
        const resultText: string = processedLines.join('\n');

        //Смена прошлого выделенного текста на новый
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(selection, resultText);
        });

        //Сообщение о завершении работы и вывод количества операций в тексте
        vscode.window.showInformationMessage(`Операции успешно размечены. Всего найдено: ${operCount}`);
    });

    context.subscriptions.push(dispos);
}

export function deactivate(): void {}