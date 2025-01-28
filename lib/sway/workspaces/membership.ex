defmodule Sway.Workspaces.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memberships" do
    field :is_admin, :boolean, default: false
    field :is_active, :boolean, default: true
    #field :workspace_id, :id
    #field :user_id, :id

    belongs_to :workspace, Sway.Workspaces.Workspace
    belongs_to :user, Sway.Accounts.User

    timestamps()
  end

  @doc false
  def changeset(membership, attrs) do
    membership
    |> cast(attrs, [:is_admin, :workspace_id, :user_id, :is_active])
    |> validate_required([:is_admin, :workspace_id, :user_id])
    |> unique_constraint(:user_workspace, name: :memberships_user_id_workspace_id_index)
  end
end
