defmodule SwayWeb.FormPageComponent do
  use Phoenix.Component
  alias SwayWeb.Router.Helpers, as: Routes

  def form(assigns) do
    ~H"""
    <div class="form-page">
    <div class="form">
    <%= render_slot(@inner_block) %>
    </div>
    <%= if !assigns[:hide_waitlist] do %>
    <div class="waitlist">
      <a href="https://swayapp.typeform.com/to/ZfgqmarJ">Join Waitlist</a>
      </div>
      <% end %>
    </div>
    """
  end

  def header(assigns) do
    alert = Phoenix.Controller.get_flash(assigns.conn, :error)
    info = Phoenix.Controller.get_flash(assigns.conn, :info)

    ~H"""
    <header>
    <div class="titlebar">
    <div class="traffic-lights">
    <div class="light"></div>
    <div class="light"></div>
    <div class="light"></div>
    </div>
    <div class="title">Sway</div></div>
    <a class="logo" href='/'>
	<img src={Routes.static_path(assigns.conn, "/images/logo_small.png")} />
      </a>
      <h1><%= @title %></h1>
      <%= if assigns[:inner_block] do %>
      <%= render_slot(@inner_block) %>
      <% end %>
      <%= if info do %>
      <div class="alert info"><%= info %></div>
      <% end %>
      <%= if alert do %>
      <div class="alert error"><%= alert %></div>
      <% end %>
      </header>
    """
  end


end
