document.addEventListener('DOMContentLoaded', function() {

    // --- トップへ戻るボタン ---
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible'); // visibleクラスを追加して表示
        } else {
            backToTopButton.classList.remove('visible'); // visibleクラスを削除して非表示
        }
    });

    // スムーズスクロールはCSS (`html { scroll-behavior: smooth; }`) で行うため、JSからは削除してもOK
    // もし特定の箇所へのスクロールをJSで制御したい場合は残す
    backToTopButton.addEventListener('click', function(e) {
         e.preventDefault();
         // window.scrollTo({ top: 0, behavior: 'smooth' }); // CSSで対応する場合不要
         document.body.scrollTop = 0; // Safari用
         document.documentElement.scrollTop = 0; // Chrome, Firefox, IE, Opera用
    });


    // --- スクロールアニメーション (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-in'); // .fade-inクラスを持つ要素を取得

    const observerOptions = {
        root: null, // ビューポートをルートとする
        rootMargin: '0px',
        threshold: 0.1 // 要素が10%見えたらトリガー
    };

    const observerCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 要素を表示
                entry.target.classList.add('visible');

                // .fade-in-child を持つ子要素に時間差で .visible を適用
                const childElements = entry.target.querySelectorAll('.fade-in-child');
                childElements.forEach((child, childIndex) => {
                    // 遅延時間を計算 (例: 0.1秒ずつ遅らせる)
                    const delay = childIndex * 0.1;
                    child.style.transitionDelay = `${delay}s`;
                    // 少し遅れて visible クラスを追加（transitionが効くように）
                    setTimeout(() => {
                         child.classList.add('visible');
                    }, 50); // 50ミリ秒後に実行
                });

                // 一度表示したら監視を停止（オプション）
                observer.unobserve(entry.target);
            }
        });
    };

    // Intersection Observerを作成
    const fadeInObserver = new IntersectionObserver(observerCallback, observerOptions);

    // 各要素の監視を開始
    fadeElements.forEach(el => {
        fadeInObserver.observe(el);
    });

    // --- お知らせ欄の読み込み (Google Sheets連携) ---
const newsList = document.getElementById('news-list');
// ↓↓↓ ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ ↓↓↓
// ↓↓↓ ここに KaguraさんがコピーしたGoogle Sheetsの公開用CSVのURLを貼り付けます ↓↓↓
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR92ALiQcCHompkXjXHAIR-tR5jIIzRfuGvztrcoFMtHPyghY_umAXkQq-yClDEGJyBjOnz6yVM6vU1/pub?gid=0&single=true&output=csv';
// ↑↑↑ URLを貼り付けてください ↑↑↑
// ↑↑↑ ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★ ↑↑↑

if (newsList && csvUrl && csvUrl !== 'YOUR_GOOGLE_SHEETS_CSV_URL') { // 要素があり、URLが設定されている場合のみ実行
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                // レスポンスがエラーの場合 (例: 公開設定が間違っている、URLが違う)
                throw new Error('Network response was not ok ' + response.statusText);
            }
            // 正常ならレスポンス内容をテキストとして取得
            return response.text();
        })
        .then(csvText => {
            // 取得したCSVテキストデータを処理
            newsList.innerHTML = ''; // まず「読み込み中」表示をクリア
            const lines = csvText.trim().split('\n'); // CSVを行ごとに分割

            // ヘッダー行を取得して、各列のインデックスを確認
            const headers = lines[0].split(',').map(header => header.trim().toLowerCase()); // ヘッダー名を小文字で統一
            const dateIndex = headers.indexOf('日付'); // 'date' 列のインデックス
            const titleIndex = headers.indexOf('タイトル'); // 'title' 列のインデックス
            const contentIndex = headers.indexOf('本文'); // 'content' 列のインデックス

            // 必要なヘッダーが見つからない場合はエラー表示
            if (dateIndex === -1 || titleIndex === -1 || contentIndex === -1) {
                console.error('CSVヘッダーに Date, Title, Content のいずれかが見つかりません。ヘッダー名を確認してください。');
                newsList.innerHTML = '<p>お知らせの形式が正しくありません。</p>';
                return;
            }

            // データ行のみを取得 (slice(1) でヘッダー行を除外)
            const dataLines = lines.slice(1);

            // 新しいお知らせを上に表示するために配列を逆順にする
            dataLines.reverse();

            // 表示件数を制限 (ここに表示したい最大件数を指定)
            const displayLimit = 5; // 最新5件まで表示
            const limitedDataLines = dataLines.slice(0, displayLimit);

            // 表示するお知らせがない場合のメッセージ
            if (limitedDataLines.length === 0) {
                newsList.innerHTML = '<p>新しいお知らせはありません。</p>';
                return;
            }

            // お知らせデータを1件ずつHTMLに変換して表示
            limitedDataLines.forEach(line => {
                // 注意: このCSV解析は、本文(Content)にカンマ(,)やダブルクォート(")が含まれない単純な形式を想定しています。
                // もし本文にそれらを含めたい場合は、より高度なCSV解析処理が必要です。
                const columns = line.split(','); // 各行をカンマで分割

                const date = columns[dateIndex] ? columns[dateIndex].trim() : '';
                const title = columns[titleIndex] ? columns[titleIndex].trim() : '';
                // Content列以降を結合して本文とする (簡易対応)
                const content = columns.slice(contentIndex).join(',').trim();
                // 本文がダブルクォートで囲まれていたら削除 (簡易対応)
                const cleanedContent = content.startsWith('"') && content.endsWith('"') ? content.slice(1, -1).replace(/""/g, '"') : content;

                // 各お知らせ項目を表示するHTML要素を作成
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');

                const newsDate = document.createElement('span');
                newsDate.classList.add('news-date');
                newsDate.textContent = date; // 日付を設定
                newsItem.appendChild(newsDate);

                const newsTitle = document.createElement('h3'); // h3は見出しレベルとして適切か確認
                newsTitle.classList.add('news-title');
                newsTitle.textContent = title; // タイトルを設定
                newsItem.appendChild(newsTitle);

                const newsContent = document.createElement('p');
                newsContent.classList.add('news-content');
                newsContent.textContent = cleanedContent; // 本文を設定 (HTMLタグは解釈されない)
                // もし本文(Content列)に <br> や <a> といったHTMLタグを書き込んで、それを反映させたい場合は
                // newsContent.textContent = cleanedContent; の代わりに下の行を使う（ただしXSS脆弱性に注意）
                // newsContent.innerHTML = cleanedContent; // HTMLとして解釈させる
                newsItem.appendChild(newsContent);

                // 作成したお知らせ項目をリストに追加
                newsList.appendChild(newsItem);
            });

        })
        .catch(error => {
            // データ取得や処理中にエラーが発生した場合
            console.error('お知らせの取得または処理中にエラーが発生しました:', error);
            newsList.innerHTML = '<p>お知らせの読み込みに失敗しました。URLや公開設定を確認してください。</p>';
        });
} else if (!csvUrl || csvUrl === 'YOUR_GOOGLE_SHEETS_CSV_URL') {
    // URLが設定されていない場合のメッセージ
    console.warn('Google SheetsのURLが script.js 内の csvUrl 変数に設定されていません。');
    newsList.innerHTML = '<p>お知らせ表示の準備中です。</p>';
}
// --- お知らせ欄の読み込み処理 ここまで ---

}); // End DOMContentLoaded