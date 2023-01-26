defmodule Sway.Repo.Migrations.AddUniqueConstraintToInvites do
  use Ecto.Migration

  def change do
    alter table(:invites) do
      modify :email, :string, null: false
      add :name, :string, null: false
    end
  end
end
