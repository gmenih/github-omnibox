import {sendMessage} from '../common/browser';

interface IQueryString {
    [key: string]: string;
}

function parseQuery (search: string): IQueryString {
    const query = {};
    const pairs: string[] = search.replace('?', '').split('&');
    return pairs
        .map((pair) => pair.split('='))
        .filter((pair) => pair.length === 2)
        .map(([key, value]) => [key, decodeURIComponent(value)])
        .reduce((result, [key, value]) => ({...result, [key]: value}), {});
}

const queryString: IQueryString = parseQuery(window.location.search);
if ('code' in queryString && 'state' in queryString) {
    sendMessage(queryString);
}
