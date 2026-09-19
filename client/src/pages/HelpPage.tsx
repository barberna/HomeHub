/** HelpPage renders transparency topics from one local configuration array. */
import { BadgeQuestionMarkIcon, KeyRound, LockKeyhole, Server, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/ui/Ui';
const topics = [
  {
    icon: Sparkles,
    title: 'Signing In',
    text: 'Use the email address and password provided by your household administrator. Public account registration is unavailable.',
  },
  {
    icon: KeyRound,
    title: 'Account Access',
    text: 'Members: View your profile and signout',
    text2: 'Admin: View member accounts, register users, delete members, end member sessions'
  },
  {
    icon: BadgeQuestionMarkIcon,
    title: 'Forgot Your Password?',
    text: 'Members should contact their household administrator. Administrators can select ‘Forgot Password’ on the sign-in page to request an email recovery link.',
  },
  {
    icon: LockKeyhole,
    title: 'Signing out and sessions',
    text: 'Sign out when you finish using a shared device. Administrators can end an account’s active sessions from the Users page.',
  },
  {
    icon: Server,
    title: 'Features Under Development',
    text: 'Additional household services are under development. Features coming soon...',
  },
];
export function HelpPage() {
  return (
    <div className="page">
      {/* Shared page heading; unlike service pages, Help has no service request or action. */}
      <PageHeader
        eyebrow="Help and transparency"
        title="About HomeHub"
        description="HomeHub is your household’s private account portal. Additional household services are under development."
      />

      {/* Mapping the array keeps repeated help cards consistent and easy to extend. */}
      <div className="help-grid">
        {topics.map(({ icon: Icon, title, text, text2 }) => (
          <article className="panel help-card" key={title}>
            <Icon aria-hidden="true" />
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
              {text2 && <p>{text2}</p> } 
            </div>
          </article>
        ))}
      </div>

      {/* Security reminder is separate and visually emphasized because it applies to every route. */}
      <section className="info-callout warning">
        <strong>Keep your account private</strong>
        <p>
          Do not share your password or recovery links. Contact your household administrator if you notice unexpected account activity.
        </p>
      </section>
    </div>
  );
}
