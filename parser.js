/*
romanTypingParseDictionary.json
Copyright (c) 2021 Whitefox
https://github.com/WhiteFox-Lugh/RomanTypeParser/blob/39d557f35ea727997278ee1b08634464054626a7/LICENSE
*/


const testWord = "にほんこくみんはこっかのめいよにかけぜんりょくをあげて";




async function loadMappingDict() {
    try {
        const response = await fetch('./romanTypingParseDictionary.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const mappingDict = await response.json();
        return mappingDict;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}


async function main() {

    const mappingDict = await loadMappingDict();
    let dict = new Object();
    for (let i = 0; i < mappingDict.length; i++) {
        let p = mappingDict[i].Pattern;
        let t = mappingDict[i].TypePattern;
        dict[p] = t;
    }


    const typedKey = document.getElementById("typedKey");
    const wordbox1 = document.getElementById("wordbox");
    wordbox1.value = testWord;
    
    const wordbox2 = document.getElementById("wordbox2");
    let res = constructTypeSentence(dict, testWord);
    for (const c of res.judgeAutomaton) {
        wordbox2.value += c[0];
    }
    let nowHiragana = res.parsedSentence;
    let nowChar = 0;
    let isCompleted = false;

    window.addEventListener('keydown', (e) => {
        typedKey.textContent = e.key;
        let okPhrases = res.judgeAutomaton[nowChar];
        console.log(okPhrases);
        for (let i = 0; i < okPhrases.length; i++) {
            if (e.key === okPhrases[i][0]) {
                if (okPhrases[i].length > 1) {
                okPhrases[i] = okPhrases[i].slice(1);
                wordbox2.value = wordbox2.value.slice(1);
                } else if (okPhrases[i].length === 1) {
                    okPhrases[i] = "";
                    nowChar++;
                    console.log(nowHiragana);
                    wordbox1.value = wordbox1.value.slice(nowHiragana[0].length);
                    nowHiragana = nowHiragana.slice(1);

                    break;
                }
                
            }
        }

    })


}

main();







function constructTypeSentence(mappingDict, sentenceHiragana) {
    let idx = 0;
    let uni, bi, tri;
    let judge = [];
    let parsedStr = [];
    while (idx < sentenceHiragana.length) {
        let validTypeList;
        uni = sentenceHiragana[idx].toString();
        bi = (idx + 1 < sentenceHiragana.length) ? sentenceHiragana.substring(idx, idx + 2) : "";
        tri = (idx + 2 < sentenceHiragana.length) ? sentenceHiragana.substring(idx, idx + 3) : "";

        if (mappingDict.hasOwnProperty(tri)) {
            validTypeList = mappingDict[tri].slice();
            idx += 3;
            parsedStr.push(tri);
        }
        else if (mappingDict.hasOwnProperty(bi)) {
            validTypeList = mappingDict[bi].slice();
            idx += 2;
            parsedStr.push(bi);
        }

        else {
            validTypeList = mappingDict[uni].slice();
            if (uni === "ん" && sentenceHiragana.length - 1 === idx) {
                validTypeList.splice(validTypeList.indexOf("n"), 1);
            }
            idx++;
            parsedStr.push(uni);
        }
        judge.push(validTypeList);
    }

    return { parsedSentence: parsedStr, judgeAutomaton: judge };
}
