/* eslint-disable */
import { h } from 'preact';
/* eslint-enable */
import PropTypes from 'prop-types';

const loadingCss = {
};

const loadingAnimation = (
    <div className="spinner">
        <div className="bounce1" />
        <div className="bounce2" />
        <div className="bounce3" />
    </div>
);

export const LoadingButton = ({
    className, children, isLoading, ...other
}) => (
    <button
        className={className}
        disabled={isLoading}
        style={isLoading ? loadingCss : {}}
        {...other}
    >
        {
            isLoading ?
                loadingAnimation
                :
                children
        }
    </button>
);

LoadingButton.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

LoadingButton.defaultProps = {
    className: 'button',
};
