import CheckinTKIcon from '@/icons/CheckinTKicon';
import FinanceiroTKIcon from '@/icons/FinanceiroTKIcon';
import IngressosTKIcon from '@/icons/IngressosTKIcon';
import LogoTKIcon from '@/icons/LogoTKIcon';
import LogoutIcon from '@/icons/LogoutIcon';
import PainelTKIcon from '@/icons/PainelTKIcon';
import ParticipantesTKIcon from '@/icons/ParticipantesTKIcon';
import { signOut, useSession } from 'next-auth/react';
import { Exo } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './styles.module.scss';

const buttons = [
    {
        icon: <LogoTKIcon />,

        isLogo: true,
    },

    {
        icon: <PainelTKIcon />,
        label: 'Meus Eventos',
        href: '/admin/',
        isActive: true,
        allowedRoles: ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'],
    },
    {
        icon: <IngressosTKIcon />,
        label: 'Ingressos',
        href: '/admin/ingressos/[eventId]',
        allowedRoles: ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'],
    },
    {
        icon: <ParticipantesTKIcon />,
        label: 'Participantes',
        href: '/admin/administrar-participantes/[eventId]',
        allowedRoles: ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'],
    },
    {
        icon: <CheckinTKIcon />,
        label: 'Check-in',
        href: '/admin/visao-geral/[eventId]',
        allowedRoles: ['X0v3WRX84lSVCK6wsRM5', 'Fuz4gzZy95ZVoj8dJgIo'],
    },
    {
        icon: <FinanceiroTKIcon />,
        label: 'Financeiro',
        href: '/admin/visao-geral-transacoes/[eventId]',
        allowedRoles: ['X0v3WRX84lSVCK6wsRM5'],
    },
    {
        icon: <LogoutIcon />,
        label: 'Encerrar sessão',
        flipped: true,
    },
];

const exoFont = Exo({
    weight: '400',
    subsets: ['latin-ext'],
});

const SidebarNav = () => {
    const router = useRouter();
    const { data } = useSession({
        required: true,
    });

    const handleLogout = () => {
        signOut({ redirect: true, callbackUrl: '/admin/login' });
    };

    const { eventId } = router.query as { eventId?: string };

    return (
        <nav
            className={styles.sidebarNav}
            role="naviagation"
            aria-label="Primary"
        >
            <ul className={styles['navbar-nav']}>
                {buttons.map((button, index) => {
                    const requiresEventId = button.href?.includes('[eventId]');
                    if (requiresEventId && !eventId) {
                        return null;
                    }
                    const regexDynamicPath = /\[\S*\]/g;
                    let destination = button.href ?? '#';
                    const isDynamic =
                        (button.href?.match(regexDynamicPath)?.length || 0) > 0;

                    if (
                        button.allowedRoles &&
                        !button.allowedRoles?.includes(data?.user.roleId!)
                    ) {
                        return;
                    }

                    if (isDynamic && !eventId) {
                        return;
                    }
                    if (isDynamic && button.href && eventId) {
                        destination = button.href.replace(
                            regexDynamicPath,
                            eventId
                        );
                    }
                    const isActive = router.pathname === button.href;
                    const isLogoutButton = button.label === 'Encerrar sessão';

                    return (
                        <li
                            key={index}
                            className={`${
                                button.isLogo ? styles.logo : styles['nav-item']
                            } ${isActive ? styles.active : ''}`}
                        >
                            {isLogoutButton ? (
                                <a
                                    onClick={handleLogout}
                                    className={styles['nav-link']}
                                >
                                    <span className={styles['link-text']}>
                                        {button.label}
                                    </span>
                                    <div className={styles['icon-wrapper']}>
                                        {button.icon}
                                    </div>
                                </a>
                            ) : (
                                <Link
                                    href={destination}
                                    className={styles['nav-link']}
                                >
                                    <div className={styles['icon-wrapper']}>
                                        {button.icon}
                                    </div>
                                    <span className={styles['link-text']}>
                                        {button.label}
                                    </span>
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default SidebarNav;
