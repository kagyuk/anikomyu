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

}); // End DOMContentLoaded