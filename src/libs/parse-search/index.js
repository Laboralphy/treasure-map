/**
 * Parse a string of format "?param1=value1&param2=value2"
 * useful when it comes to get parameters from an url
 * good to GIT
 */
function parseSearch(sSearch) {
    if (sSearch) {
        let nQuest = sSearch.indexOf('?');
        if (nQuest >= 0) {
            sSearch = sSearch.substr(nQuest + 1);
        } else {
            return {};
        }
    } else {
        sSearch = window.location.search.substr(1);
    }
    let match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        query  = sSearch,
        _decode = s => decodeURIComponent(s.replace(pl, ' '));
    let oURLParams = {};
    while (match = search.exec(query)) {
        oURLParams[_decode(match[1])] = _decode(match[2]);
    }
    return oURLParams;
}

export default parseSearch;
