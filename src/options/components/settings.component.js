/* eslint-disable */
import { h } from 'preact';
import { OPTION_STRINGS as OPT } from '../../constants';

const CheckBox = ({
    children, title, settingName, values, onChange,
}) => (
    <label>
        <input type="checkbox" onChange={onChange.bind(null, settingName)} checked={values[settingName] === true} />
    <span className="checkable">{ children }</span>
  </label>
);

export const Settings = ({ values, onChange, clearSettings }) => (
    <div className="other-settings">
        <h2>Other settings</h2>
        <article className="card">
            <header>
                <h3>Search settings</h3>
            </header>
            <div className="container">
                <CheckBox settingName={OPT.SEARCH_NAME} values={values} onChange={onChange}>
                    Search by repository name
                </CheckBox>
                <br />
                <CheckBox settingName={OPT.SEARCH_DESC} values={values} onChange={onChange}>
                    Search by repository description
                </CheckBox>
                <br />
                <CheckBox settingName={OPT.SEARCH_LABEL} values={values} onChange={onChange}>
                    Search by repository labels
                </CheckBox>
                <br />
                <CheckBox settingName={OPT.SEARCH_FORKED} values={values} onChange={onChange}>
                    Include forked repositories
                </CheckBox>
                <br />
            </div>
        </article>
        <div>
            <button className="warning" onClick={ clearSettings }>Clear all settings</button>
        </div>
  </div>
);
