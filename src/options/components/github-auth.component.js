import { h } from 'preact';

export const GithubAuth = () => (
    <article className="card github-auth">
        <header>
            <h3>Github login</h3>
        </header>
        <p>
            <span className="label">Note</span>&nbsp;
            Your organization owners might have restricted access to third party apps (this extension). In that case, it's better to use the mehtod below.
        </p>
        <footer className="flex one center">
            <div className="center-button">
                <button className="success github-button">Authorize Github</button>
            </div>
        </footer>
    </article>
);
