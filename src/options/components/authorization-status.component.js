/* eslint-disable */
import { h } from 'preact';
/* eslint-enable */
import PropTypes from 'prop-types';

const SuccessMessage = () => (
    <div className="alert success">
        Looks like you're all done! If you want to set up a new token, you can expand the section below.
    </div>
);

const WarningMessage = () => (
    <div className="alert info">
       Looks like you haven't set up your token yet! You can keep using the extension, but your search will be global through GitHub.
    </div>
);

const showMessage = (tokenSet) => {
    if (!tokenSet) return <SuccessMessage />;
    return <WarningMessage />;
};

export const AuthorizationStatus = ({ isTokenSet, children }) => (
    <div className="auth-wrapper">
        { showMessage(isTokenSet) }
        <div className="billboard">
            { children }
        </div>
    </div>
);

AuthorizationStatus.propTypes = {
    isTokenSet: PropTypes.bool.isRequired,
    children: PropTypes.arrayOf(PropTypes.node),
};

AuthorizationStatus.defaultProps = {
    children: [],
};
