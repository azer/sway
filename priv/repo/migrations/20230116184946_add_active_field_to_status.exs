defmodule Bafa.Repo.Migrations.AddActiveFieldToStatus do
  use Ecto.Migration

  def change do
    alter table(:statuses) do
      add :is_active, :boolean, default: false
    end
  end
end
