defmodule Sway.Workspaces.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memberships" do
    field :is_admin, :boolean, default: false
    #field :workspace_id, :id
    #field :user_id, :id

    belongs_to :workspace, Sway.Workspaces.Workspace
    belongs_to :user, Sway.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(membership, attrs) do
    membership
    |> cast(attrs, [:is_admin, :workspace_id, :user_id])
    |> validate_required([:is_admin, :workspace_id, :user_id])
  end
end
