/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-indent */
import { h, Component } from 'preact';

import { browser, storageWrapper } from '../../browser';
import { OPTION_STRINGS as OPTIONS } from '../../constants';
import { GithubAuth } from './github-auth.component';
import { SelfToken } from './token-auth.component';

const storage = storageWrapper(browser.storage.local);

export class AuthComponent extends Component {
    constructor() {
        super();
        this.state = {
            authKeySet: false,
        };
    }

    componentWillMount() {
        storage.getItem(OPTIONS.GITHUB_TOKEN)
            .then((value) => {
                if (value) {
                    this.setState({ authKeySet: true });
                }
            });
    }

    showAuthWarning() {
        if (this.state.authKeySet === true) {
            return (
                <p>
                    <span className="label success">Great!</span> 
                    {' You\'re all set. If you wish, you can change your token below.'}
                </p>
            );
        }
        return (
            <p>
                <span className="label warning">Oops!</span>
                {' Looks like you haven\'t set your auth key yet. Please do so, to make the extension useful.'}
                <br />
                <br />
                You can set it up by logging in using Github, or generating your own token, and entering it below.
            </p>
        );
    }

    render() {
        return (
            <div className="authorization">
                <h2>Authorization token</h2>
                <div className="content">
                    { this.showAuthWarning() }
                </div>
                <div className="billboard">
                    <GithubAuth />
                    <SelfToken />
                </div>
            </div>
        );
    }
}
