defmodule Bafa.Repo.Migrations.CreateOrgs do
  use Ecto.Migration

  def change do
    create table(:orgs) do
      add :name, :string
      add :domain, :string

      timestamps()
    end
  end
end
