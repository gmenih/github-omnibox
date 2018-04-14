// import { browser } from '../browser';
// import { handleTextChanged } from './omnibox.handlers';

// console.log(browser);
// browser.omnibox.setDefaultSuggestion({
//     description: 'Github repo name',
// });

// browser.omnibox.onInputChanged.addListener(handleTextChanged)

import { client } from '../github/client';
import getAllRepos from '../github/queries/getAllRepos.gql';

client('48a3b45d7bbbc036c3b5f871208edb1f281daa03')
    .query({
        query: getAllRepos,
    })
    .then(({ data }) => {
        console.log('we got that data');
        const userRepos = data.viewer.repositories.nodes;
        const orgRespos = data.viewer.organizations.nodes.reduce((all, organization) => {
            return [...all, ...organization.repositories.nodes]
        }, []);
        console.log([...userRepos, ...orgRespos]);
    })
    .catch(console.error);
