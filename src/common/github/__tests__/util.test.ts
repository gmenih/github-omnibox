import {toQueryString} from '../utils';

describe('Github Util', () => {
    test.each([
        {this: 'object', to: 'query'},
        {should: 'properly', convert: 15, things: true},
        {even: 'weird\nvalues', like: true},
    ])('should properly convert to queryString', (object: any) => {
        expect(toQueryString(object)).toMatchSnapshot();
    });
});
