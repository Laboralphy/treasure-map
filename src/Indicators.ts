class Indicators {
    static progress(n100: number): void {
        const elemProgress = document.querySelector('#progress-tiles') as HTMLElement;
        const elemProgressValue = elemProgress.querySelector('span.value') as HTMLElement;
        if (elemProgress.classList.contains('hidden')) {
            elemProgress.classList.remove('hidden');
        }
        elemProgressValue.innerText = n100.toString() + '%';
        if (n100 === 100 && !elemProgress.classList.contains('hidden')) {
            elemProgress.classList.add('hidden');
        }
        const elemProgressBar = elemProgress.querySelector('div.progress > div.bar') as HTMLElement;
        elemProgressBar.style.width = n100.toString() + '%';
    }
}

export default Indicators;
