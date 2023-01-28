defmodule SwayWeb.FormPageComponent do
  use Phoenix.Component
  alias SwayWeb.Router.Helpers, as: Routes

  def form(assigns) do
    ~H"""
    <div class="page">
    <div class="form">
    <%= render_slot(@inner_block) %>
    </div>
    </div>
    """
  end

  def header(assigns) do
    ~H"""
    <header>
    <div class="logo">
	<img src={Routes.static_path(assigns.conn, "/images/logo_small.png")} />
      </div>
      <h1><%= @title %></h1>
      <%= if assigns[:inner_block] do %>
      <%= render_slot(@inner_block) %>
      <% end %>
    </header>
    """
  end
end
