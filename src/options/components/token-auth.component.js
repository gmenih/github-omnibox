import { h } from 'preact';

export const SelfToken = () => (
    <article className="card github-auth">
        <header>
            <h4>Self generated token</h4>
        </header>
        <p>
            Visit <a href="https://github.com/settings/token">Github settings</a> to generate your token. Make sure to give it full <code>repo</code> access. If you which to also read your organizations' repositories, add <code>read:org</code> access.
        </p>
        <footer>
            <div className="flex one five-600 four-800">
                <div className="four-fifth-600 three-fourth-800">
                    <input type="text" placeholder="Github token..."/>
                </div>
                <div>
                    <button type="submit">Save token</button>
                </div>
            </div>
        </footer>
    </article>
);
