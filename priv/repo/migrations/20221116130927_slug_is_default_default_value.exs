defmodule Sway.Repo.Migrations.SlugIsDefaultDefaultValue do
  use Ecto.Migration

  def change do
    alter table(:rooms) do
      modify :is_default, :boolean, default: false, null: false
    end
  end
end
