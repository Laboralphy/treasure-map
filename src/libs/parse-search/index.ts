function parseSearch(sSearch?: string): Record<string, string> {
    let s: string;
    if (sSearch) {
        const nQuest = sSearch.indexOf('?');
        if (nQuest >= 0) {
            s = sSearch.substr(nQuest + 1);
        } else {
            return {};
        }
    } else {
        s = window.location.search.substr(1);
    }
    const pl = /\+/g;
    const search = /([^&=]+)=?([^&]*)/g;
    const _decode = (str: string) => decodeURIComponent(str.replace(pl, ' '));
    const oURLParams: Record<string, string> = {};
    let match: RegExpExecArray | null;
    while ((match = search.exec(s)) !== null) {
        oURLParams[_decode(match[1])] = _decode(match[2]);
    }
    return oURLParams;
}

export default parseSearch;
