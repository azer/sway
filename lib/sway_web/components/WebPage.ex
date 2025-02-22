defmodule SwayWeb.WebPageComponent do
  use Phoenix.Component
  alias SwayWeb.Router.Helpers, as: Routes

  def page(assigns) do
    ~H"""
    <div class="webpage">
    <%= render_slot(@inner_block) %>
    </div>

    <footer class="page-footer">
    <div class="column">
    <div class="right">
    <div class="footer-nav-block">
    <h4>Product</h4>
    <a href="/#features">Features</a>
    <a href="/pricing">Pricing</a>
    <a href="/pricing#faq">FAQ</a>
    <a target="_blank" href="https://www.youtube.com/watch?v=iSaE0Cq_rPc">Demo  <span class="opacity-50">↗</span></a>
    </div>

    <div class="footer-nav-block">
    <h4>Social</h4>
    <a href="/blog">Blog</a>
    <a href="https://twitter.com/swaydotso">Twitter <span class="opacity-50">↗</span></a>
    <a href="https://www.linkedin.com/company/swayhq">Linkedin <span class="opacity-50">↗</span></a>
    </div>
    <div class="footer-nav-block">
    <h4>Company</h4>
    <a href="/about">About</a>
    <a href="/about#team">Team</a>
    <a href="mailto:azer@sway.so">Email <span class="opacity-50">↗</span></a>
    </div>



    </div>
    <div class="company">© 2023 Sway Technologies.</div>
    </div>

    </footer>

    """
  end

  def header(assigns) do
    ~H"""
    <header class="topbar">
    <div class="column">
      <a href="/" class="logo"><svg height="32px" viewBox="110 0 1017 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="250.5" cy="250.5" r="90" stroke="#000" stroke-opacity=".08" stroke-width="35"/>
  <mask id="b" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="113" y="113" width="275" height="275">
    <circle cx="250.5" cy="250.5" r="117.5" stroke="#fff" stroke-width="40"/>
  </mask>
  <g filter="url(#a)" mask="url(#b)">
    <rect y="500" width="500" height="500" rx="100" transform="rotate(-90 0 500)" fill="url(#c)" fill-opacity=".9"/>
    <rect x="10" y="490" width="480" height="480" rx="90" transform="rotate(-90 10 490)" stroke="#fff" stroke-width="20"/>
  </g>
  <path d="M561.404 214.711c-.762-7.133-3.975-12.687-9.638-16.662-5.608-3.975-12.904-5.962-21.889-5.962-6.316 0-11.734.953-16.253 2.858-4.52 1.906-7.977 4.492-10.373 7.76-2.396 3.267-3.621 6.996-3.676 11.189 0 3.485.79 6.507 2.369 9.066 1.633 2.559 3.839 4.737 6.616 6.534 2.777 1.743 5.853 3.213 9.229 4.411a99.277 99.277 0 0 0 10.21 3.022l15.681 3.92a107.95 107.95 0 0 1 18.214 5.963c5.881 2.504 11.135 5.663 15.764 9.474a42.068 42.068 0 0 1 11.108 13.803c2.722 5.391 4.083 11.707 4.083 18.949 0 9.801-2.504 18.432-7.514 25.892-5.009 7.405-12.251 13.204-21.726 17.397-9.42 4.138-20.827 6.207-34.222 6.207-13.014 0-24.312-2.015-33.896-6.044-9.528-4.029-16.988-9.91-22.379-17.642-5.336-7.732-8.222-17.152-8.657-28.26h29.811c.436 5.826 2.233 10.672 5.391 14.538 3.158 3.866 7.269 6.752 12.333 8.658 5.118 1.906 10.836 2.859 17.152 2.859 6.589 0 12.36-.98 17.315-2.941 5.01-2.014 8.93-4.791 11.762-8.331 2.831-3.593 4.274-7.786 4.329-12.578-.055-4.356-1.334-7.95-3.839-10.781-2.505-2.886-6.017-5.282-10.536-7.188-4.465-1.96-9.693-3.702-15.682-5.227l-19.031-4.9c-13.776-3.54-24.666-8.903-32.67-16.091-7.95-7.242-11.925-16.852-11.925-28.831 0-9.856 2.668-18.486 8.004-25.892 5.391-7.405 12.715-13.149 21.971-17.233 9.257-4.139 19.739-6.208 31.446-6.208 11.87 0 22.27 2.069 31.2 6.208 8.984 4.084 16.036 9.774 21.154 17.07 5.118 7.242 7.759 15.573 7.922 24.993h-29.158ZM632.948 336l-35.447-125.455h30.138l22.053 88.211h1.143l22.543-88.211h29.812l22.542 87.721h1.226l21.725-87.721h30.221L743.374 336h-30.791l-23.523-84.78h-1.715L663.822 336h-30.874Zm191.2 2.532c-7.95 0-15.11-1.416-21.481-4.247-6.316-2.886-11.325-7.133-15.028-12.742-3.648-5.608-5.472-12.523-5.472-20.745 0-7.079 1.306-12.932 3.92-17.561 2.614-4.628 6.18-8.331 10.7-11.108 4.519-2.777 9.61-4.873 15.273-6.289a124.159 124.159 0 0 1 17.724-3.185c7.351-.762 13.313-1.443 17.887-2.042 4.574-.653 7.895-1.634 9.964-2.94 2.124-1.362 3.186-3.458 3.186-6.289v-.491c0-6.152-1.824-10.917-5.473-14.293-3.648-3.376-8.902-5.064-15.763-5.064-7.242 0-12.987 1.579-17.234 4.737-4.192 3.159-7.024 6.888-8.494 11.19l-27.607-3.92c2.178-7.623 5.772-13.994 10.782-19.113 5.009-5.172 11.135-9.038 18.377-11.598 7.242-2.613 15.246-3.92 24.013-3.92 6.044 0 12.06.708 18.05 2.124 5.99 1.415 11.462 3.757 16.417 7.024 4.955 3.212 8.93 7.596 11.925 13.15 3.049 5.553 4.573 12.496 4.573 20.827V336h-28.423v-17.234h-.98c-1.797 3.485-4.329 6.752-7.596 9.801-3.212 2.995-7.269 5.418-12.17 7.27-4.846 1.797-10.536 2.695-17.07 2.695Zm7.678-21.726c5.935 0 11.08-1.171 15.436-3.512 4.356-2.396 7.705-5.554 10.047-9.474 2.395-3.921 3.593-8.195 3.593-12.824v-14.783c-.925.762-2.504 1.47-4.737 2.124-2.178.653-4.628 1.225-7.351 1.715-2.722.49-5.418.926-8.086 1.307-2.668.381-4.982.708-6.942.98-4.411.599-8.358 1.579-11.843 2.94-3.485 1.361-6.235 3.267-8.249 5.717-2.015 2.396-3.022 5.5-3.022 9.312 0 5.445 1.987 9.556 5.962 12.333 3.975 2.777 9.039 4.165 15.192 4.165Zm90.676 66.239c-4.029 0-7.759-.326-11.189-.98-3.376-.599-6.071-1.306-8.086-2.123l6.861-23.033c4.301 1.252 8.14 1.851 11.516 1.797 3.376-.054 6.344-1.116 8.903-3.185 2.613-2.015 4.819-5.391 6.616-10.128l2.531-6.779-45.493-128.069h31.364l28.913 94.745h1.307l28.995-94.745h31.45l-50.236 140.647c-2.341 6.643-5.445 12.333-9.311 17.07-3.866 4.792-8.603 8.44-14.212 10.945-5.554 2.559-12.197 3.838-19.929 3.838Z" fill="#151517"/>
  <defs>
    <linearGradient id="c" x1="250" y1="500" x2="250" y2="1000" gradientUnits="userSpaceOnUse">
      <stop offset=".229" stop-color="#53D6FF"/>
      <stop offset=".839" stop-color="#FF59A9"/>
    </linearGradient>
    <filter id="a" x="-25" y="-21" width="550" height="550" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="12.5"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
      <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_0_1"/>
      <feBlend in="SourceGraphic" in2="effect1_dropShadow_0_1" result="shape"/>
    </filter>
  </defs>
  </svg></a>
  <div class="burger-menu-button">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="h-5 w-5"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
  </div>

<div class="nav">
<div class="links">
<a href="/#features">Features</a>
<a href="/pricing">Pricing</a>
<a href="/blog">Blog</a>
<a href="/about">About</a>
</div>
<%= if assigns.conn.assigns.current_user do %>
<a href={"/" <> assigns.conn.assigns.current_workspace.slug} class="primary launch">Open app</a>
<% else %>
<a href="/login" class="primary">Login</a>
<% end %>
</div>
</div>
<div class="burger-menu">
<a href="/#features">Features</a>
<a href="/pricing">Pricing</a>
<a href="/blog">Blog</a>
<a href="/about">About</a>
<%= if assigns.conn.assigns.current_user do %>
<a href={"/" <> assigns.conn.assigns.current_workspace.slug} class="primary launch">Open app</a>
<% else %>
<a href="/login" class="primary">Login</a>
<% end %>
</div>
 <script type="text/javascript">
  const burgerButton = document.querySelector('.burger-menu-button')
  const burgerMenu = document.querySelector('.burger-menu')
  burgerButton.onclick = function() {
    burgerMenu.style.display = burgerMenu.style.display == 'flex' ? 'none' : 'flex';
  }
  </script>
    </header>
    """
  end

end
