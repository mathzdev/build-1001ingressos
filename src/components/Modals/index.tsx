import ForgotPasswordModal from './ForgotPasswordModal';
import NewPasswordModal from './NewPasswordModal';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

const Modals = {
    SignInModal,
    SignUpModal,
    ForgotPasswordModal,
    NewPasswordModal,
};

export type ModalsType = {
    [K in keyof typeof Modals]: HTMLDialogElement;
};

export default Modals;
