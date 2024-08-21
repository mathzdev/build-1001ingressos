import styles from './styles.module.scss';

const Switch = ({ isOn, handleToggle, onColor, name }: any) => {
    return (
        <label
            style={{ background: isOn && onColor }}
            className={styles.reactSwitch}
        >
            <input
                checked={isOn}
                onChange={handleToggle}
                className={styles.reactSwitchCheckbox}
                type="checkbox"
                name={name}
            />
            <div className={styles.reactSwitchButton} />
            <div className={styles.ReactSwitchLabels}>
                <span className={styles.left}>Visível</span>
                <span className={styles.right}>Oculto</span>
            </div>
        </label>
    );
};

export default Switch;
