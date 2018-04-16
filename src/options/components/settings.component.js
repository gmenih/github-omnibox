import { h } from 'preact';

export const Settings = (props) => (
    <div className="other-settings">
        <h2>Other settings</h2>
        <article className="card">
            <header>
                <h3>Search settings</h3>
            </header>
            <div className="container">
            <label>
                <input type="checkbox" />
                <span className="checkable">Include forked repositories</span>
            </label>
            <br />
            <label>
                <input type="checkbox" />
                <span className="checkable">Search by repository name</span>
            </label>
            <br />
            <label>
                <input type="checkbox" />
                <span className="checkable">Search by repository description</span>
            </label>
            <br />
            <label>
                <input type="checkbox" />
                <span className="checkable">Search by repository labels</span>
            </label>
            </div>
        </article>
        <div>
            <button className="warning">Clear all settings</button>
        </div>
    </div>
);
