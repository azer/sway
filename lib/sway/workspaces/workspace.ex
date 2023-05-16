defmodule Sway.Workspaces.Workspace do
  use Ecto.Schema
  import Ecto.Changeset

  schema "workspaces" do
    field :domain, :string
    field :logo_url, :string
    field :name, :string
    field :slug, :string
    field :is_active, :boolean
    field :daily_room_url, :string

    timestamps()
  end

  @doc false
  def changeset(workspace, attrs) do
    workspace
    |> cast(attrs, [:name, :domain, :slug, :logo_url, :daily_room_url])
    |> validate_required([:name, :domain, :slug])
    |> unique_constraint(:domain, name: :workspaces_domain_is_active_index)
    |> unique_constraint(:slug, name: :workspaces_slug_index)
    |> unique_constraint(:daily_room_url)
  end
end
