<link rel="stylesheet" href="./walkthrough.css">

<section class="hunt-walkthrough">
  <div class="hunt-walkthrough__intro">
    <p class="hunt-walkthrough__eyebrow">HomeHub Authentication Walkthrough</p>
    <h3>Explore HomeHub authentication</h3>
    <p>HomeHub provides a one-time setup process for creating the initial administrator account. The administrator then creates and manages household member accounts.</p>
  </div>

  <article class="hunt-walkthrough__step">
    <div class="hunt-walkthrough__copy">
      <p class="hunt-walkthrough__number">01 / Admin Registration</p>
      <h3>Open /setup to create the administrator</h3>
      <p>The /setup route opens the administrator registration page. HomeHub checks whether initial setup is available before displaying the form. After setup is complete, this route redirects to the login page.</p>
      <span class="hunt-walkthrough__tag">One-time administrator provisioning</span>
    </div>
    <div class="hunt-walkthrough__device">
      <img src="./images/admin_setup.png" alt="HomeHub initial administrator setup form" loading="lazy">
    </div>
  </article>

  <article class="hunt-walkthrough__step hunt-walkthrough__step--reverse">
    <div class="hunt-walkthrough__copy">
      <p class="hunt-walkthrough__number">02 / Login</p>
      <h3>Log in for the first time</h3>
      <p>Log in as the administrator to manage your household members. A successful login creates a session that allows access to protected HomeHub routes. Administrator features also require the administrator role.</p>
      <span class="hunt-walkthrough__tag">Login and session creation</span>
    </div>
    <div class="hunt-walkthrough__device">
      <img src="./images/login.png" alt="HomeHub login form" loading="lazy">
    </div>
  </article>

  <article class="hunt-walkthrough__step">
    <div class="hunt-walkthrough__copy">
      <p class="hunt-walkthrough__number">03 / User Management</p>
      <h3>Manage household member accounts</h3>
      <p>The administrator can create accounts for household members. Each member appears on an account card in the account management page. These cards show session information and provide controls for resetting passwords, ending sessions, and deleting accounts. Deleting an account requires confirmation.</p>
      <span class="hunt-walkthrough__tag">Account Creation</span>
    </div>
    <div class="hunt-walkthrough__device">
      <img src="./images/admin.png" alt="HomeHub household account management page" loading="lazy">
    </div>
  </article>

   <article class="hunt-walkthrough__step hunt-walkthrough__step--reverse">
    <div class="hunt-walkthrough__copy">
      <p class="hunt-walkthrough__number">04 / Password Reset</p>
      <h3>Reset member passwords</h3>
      <p>Only the HomeHub administrator can reset household members’ passwords. To reset a password, select the password reset option on the member’s account card and enter a new password.</p>
      <span class="hunt-walkthrough__tag">Password Reset</span>
    </div>
    <div class="hunt-walkthrough__device">
      <img src="./images/passwordReset.png" alt="HomeHub member password reset form" loading="lazy">
    </div>
  </article>

  <article class="hunt-walkthrough__step">
    <div class="hunt-walkthrough__copy">
      <p class="hunt-walkthrough__number">05 / Session Management</p>
      <h3>Manage user sessions remotely</h3>
      <p>Account cards display the creation time of each user’s most recent session, or indicate that no session was found. The administrator can revoke a user’s sessions remotely, requiring the user to sign in again to access protected resources.</p>
      <span class="hunt-walkthrough__tag">Sessions</span>
    </div>
    <div class="hunt-walkthrough__device">
      <img src="./images/before-session-end.png" alt="HomeHub account card before session revocation" loading="lazy">
      <img  src="./images/after-session-end.png" alt="HomeHub account card after session revocation"/>
    </div>
  </article>

  <article class="hunt-walkthrough__step hunt-walkthrough__step--reverse">
    <div class="hunt-walkthrough__copy">
      <p class="hunt-walkthrough__number">06 / Admin Password Recovery</p>
      <h3>Recover the administrator password by email</h3>
      <p>Administrator password recovery is available from the login page. Anyone can submit an email address, but recovery links are sent only to administrator accounts. The interface uses the same confirmation message regardless of whether the address belongs to an administrator, helping prevent account identification. HomeHub sends recovery emails through Gmail using Nodemailer.</p>
      <span class="hunt-walkthrough__tag">Password Recovery</span>
    </div>
    <div class="hunt-walkthrough__device">
      <img src="./images/admin-resetpassword.png" alt="HomeHub administrator password recovery form" loading="lazy">
    </div>
  </article>
</section>