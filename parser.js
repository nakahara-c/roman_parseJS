/*
romanTypingParseDictionary.json
Copyright (c) 2021 Whitefox
https://github.com/WhiteFox-Lugh/RomanTypeParser/blob/main/LICENSE
*/





// Fetch APIを使ってmappingDict.jsonを取得
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

// 非同期処理を適切に扱うために、別のasync関数内でloadMappingDictを呼び出します。
async function main() {

    const mappingDict = await loadMappingDict();
    let dict = new Object();
    for (let i = 0; i < mappingDict.length; i++) {
        let p = mappingDict[i].Pattern;
        let t = mappingDict[i].TypePattern;
        dict[p] = t;
    }


    const testWord = "にほんこくみんはこっかのめいよにかけぜんりょくをあげて"
    const typedKey = document.getElementById("typedKey");
    const wordbox1 = document.getElementById("wordbox");
    wordbox1.value = testWord;
    
    const wordbox2 = document.getElementById("wordbox2");
    let res = constructTypeSentence(dict, testWord);
    for (const c of res.judgeAutomaton) {
        wordbox2.value += c[0];
    }
    let nowChar = 0;

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
                    wordbox1.value = wordbox1.value.slice(1);


                    break;
                }
                
                //wordbox2.value = wordbox2.value.slice(0, nowChar) + phrase + wordbox2.value.slice(nowChar + 1);
                //nowChar++;
                //break;
            }
        }

    })


}

main();







function constructTypeSentence(mappingDict, sentenceHiragana) {
    // 何文字目かを表すインデックス
    let idx = 0;
    // uni が1文字
    // bi が2文字
    // tri が3文字
    let uni, bi, tri;
    // judge はあとで説明するオートマトンのようなもの
    let judge = [];
    // 文字がどのように区切られたかをリストで表す
    let parsedStr = [];
    while (idx < sentenceHiragana.length) {
        let validTypeList;
        // 今見ているところから1、2、3文字切り出す
        uni = sentenceHiragana[idx].toString();
        bi = (idx + 1 < sentenceHiragana.length) ? sentenceHiragana.substring(idx, idx + 2) : "";
        tri = (idx + 2 < sentenceHiragana.length) ? sentenceHiragana.substring(idx, idx + 3) : "";

        // 3文字でマッチング
        if (mappingDict.hasOwnProperty(tri)) {
            validTypeList = mappingDict[tri].slice();
            idx += 3;
            parsedStr.push(tri);
        }
        // 3文字パターンに該当するものがなければ2文字でマッチング
        else if (mappingDict.hasOwnProperty(bi)) {
            validTypeList = mappingDict[bi].slice();
            idx += 2;
            parsedStr.push(bi);
        }

        // 2文字でもマッチングしなければ1文字
        else {
            validTypeList = mappingDict[uni].slice();
            // 文末「ん」の処理
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
