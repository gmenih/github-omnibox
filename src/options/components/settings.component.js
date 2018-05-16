/* eslint-disable */
import { h } from 'preact';
/* eslint-enable */
import PropTypes from 'prop-types';
import { observer } from 'mobx-preact';
import { OPTION_STRINGS as OPT } from '../../constants';
import { options } from '../../options.observable';

const onSettingChange = (settingName, event) => {
    let { value } = event.target;
    if (event && event.target && event.target.type === 'checkbox') {
        value = !!event.target.checked;
    }
    options.setValue(settingName, value);
};

const CheckBox = observer(({ children, settingName }) => (
    <label htmlFor={settingName}>
        <input
            id={settingName}
            type="checkbox"
            onChange={e => onSettingChange(settingName, e)}
            checked={options[settingName] === true}
        />
        <span className="checkable">{ children }</span>
    </label>
));

CheckBox.propTypes = {
    children: PropTypes.string.isRequired,
    settingName: PropTypes.string.isRequired,
};

export const Settings = () => (
    <div className="other-settings">
        <h2>Other settings</h2>
        <article className="card">
            <header>
                <h3>Search settings</h3>
            </header>
            <div className="container">
                <CheckBox settingName={OPT.SEARCH_NAME}>
                    Search by repository name
                </CheckBox>
                <br />
                <CheckBox settingName={OPT.SEARCH_DESC}>
                    Search by repository description
                </CheckBox>
                <br />
                <CheckBox settingName={OPT.SEARCH_LABEL}>
                    Search by repository labels
                </CheckBox>
                <br />
                <CheckBox settingName={OPT.SEARCH_FORKED}>
                    Include forked repositories
                </CheckBox>
                <br />
            </div>
        </article>
        <div>
            <button className="warning" onClick={options.clearOptions}>Clear all settings</button>
        </div>
    </div>
);
