defmodule SwayWeb.UserView do
  use SwayWeb, :view
  alias SwayWeb.UserView

  def render("index.json", %{users: users}) do
    %{data: render_many(users, UserView, "user.json")}
  end

  def render("show.json", %{user: user}) do
    %{data: render_one(user, UserView, "user.json")}
  end

  def render("user.json", %{user: user}) do
    encode(user)
  end

  def encode(user) do
    %{
      id: SwayWeb.Hashing.encode_user(user.id),
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
      inserted_at: user.inserted_at
    }
  end
end
