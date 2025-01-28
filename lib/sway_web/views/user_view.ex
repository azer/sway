defmodule SwayWeb.UserView do
  use SwayWeb, :view
  alias SwayWeb.UserView
  alias SwayWeb.APIView

  def render("index.json", %{users: users}) do
    %{
      list: render_many(users, UserView, "user.json"),
      links: APIView.links(:users, UserView, users)
    }
  end

  def render("show.json", %{user: user}) do
    %{
      result: render_one(user, UserView, "user.json"),
      links: APIView.links(:users, UserView, user)
    }
  end

  def render("user.json", %{user: user}) do
    APIView.row(encode(user), :users)
  end

  def encode(user) do
    %{
      id: SwayWeb.Hashing.encode_user(user.id),
      email: user.email,
      name: user.name,
      profile_photo_url: user.profile_photo_url,
      is_active: user.is_active,
      inserted_at: user.inserted_at
    }
  end
end
