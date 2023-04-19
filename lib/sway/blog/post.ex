defmodule Sway.Blog.Post do
  use Ecto.Schema
  import Ecto.Changeset

  schema "blog_posts" do
    field :body, :string
    field :changelog, :boolean, default: false
    field :draft, :boolean, default: true
    field :title, :string

    belongs_to :author, Sway.Accounts.User
    belongs_to :workspace, Sway.Workspaces.Workspace

    timestamps()
  end

  @doc false
  def changeset(post, attrs) do
    post
    |> cast(attrs, [:title, :body, :draft, :author_id, :workspace_id, :changelog])
    |> validate_required([:title, :body, :draft, :author_id])
  end
end
