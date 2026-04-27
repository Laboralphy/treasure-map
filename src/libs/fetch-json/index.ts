export async function fetchJSON(url: string, postData: unknown = null): Promise<unknown> {
    const bPost = !!postData;
    const oRequest: RequestInit = {
        method: bPost ? 'POST' : 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    };
    if (bPost) {
        (oRequest as { body: string }).body = JSON.stringify(postData);
    }
    const response = await fetch(url, oRequest);
    switch (response.status) {
        case 404:
            throw new Error('Error 404 document not found: ' + url);
        case 500:
            throw new Error('Error 500 internal server error');
        default:
            return response.json();
    }
}

export async function deleteJSON(url: string): Promise<unknown> {
    const oRequest: RequestInit = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    };
    const response = await fetch(url, oRequest);
    const oJSON = await response.json() as { message?: string };
    if (response.status === 500) {
        throw new Error('Error 500 : internal server error : ' + oJSON.message);
    }
    return oJSON;
}
