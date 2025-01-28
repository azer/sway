defmodule Sway.Repo.Migrations.AddUniqueConstraintToInvites do
  use Ecto.Migration

  def change do
    alter table(:invites) do
      add :name, :string, null: false
    end
    create unique_index(:invites, [:email])
  end
end
