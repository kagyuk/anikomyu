// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', function() {

    // トップへ戻るボタンの表示・非表示
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', function() {
        // スクロール量が300pxを超えたら表示、それ未満なら非表示
        if (window.pageYOffset > 300) {
            backToTopButton.style.display = 'flex'; // 表示 (flexに変更)
        } else {
            backToTopButton.style.display = 'none'; // 非表示
        }
    });

    // トップへ戻るボタンをクリックしたときの動作 (スムーズスクロール)
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault(); // デフォルトのリンク動作を無効化
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // スムーズスクロール
        });
    });


    // --- オプション: スクロールに応じたフェードインアニメーションのヒント ---
    /*
    const fadeElements = document.querySelectorAll('.section'); // アニメーションさせたい要素を選択

    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                // 一度表示したら監視を停止する場合
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // 要素が10%見えたら発火
    });

    fadeElements.forEach(el => {
        // 初期状態を設定 (CSS側でも設定可能)
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        // 監視を開始
        fadeInObserver.observe(el);
    });
    */
    // ------------------------------------------------------------------

}); // End DOMContentLoaded