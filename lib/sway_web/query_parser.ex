defmodule SwayWeb.QueryParser do
  import Ecto.Query

  def build_query(schema, params) when is_map(params) do
    where_query = build_where_query(params)
    sort_query = build_sort_query(params)

    schema
    |> where(^where_query)
    |> order_by(^Enum.into(sort_query, []))
    |> add_limit_query(params)
    |> add_offset_query(params)
  end

  def add_limit_query(query, params) do
    case Map.get(params, "limit") do
      nil ->
        Ecto.Query.limit(query, [r], 10)

      limit_param when is_integer(limit_param) ->
        Ecto.Query.limit(query, [r], ^limit_param)

      limit_param when is_binary(limit_param) ->
        Ecto.Query.limit(query, [r], ^String.to_integer(limit_param))
    end
  end

  def add_offset_query(query, params) do
    case Map.get(params, "start") do
      nil ->
        query

      start_id ->
        Ecto.Query.where(query, [r], field(r, :id) > ^start_id)
    end
  end

  def build_where_query(params) do
    Enum.reduce(params, Ecto.Query.dynamic(true), fn {param, param_value}, dynamic ->
      case parse_where_param(param) do
        nil ->
          dynamic

        [prop, constraint] ->
          case parse_constraint(prop, constraint, param_value) do
            {:error, reason} ->
              dynamic

            constraint ->
              dynamic([r], ^dynamic and ^constraint)
          end
      end
    end)
  end

  def build_sort_query(params) do
    case params["sort"] do
      nil -> [asc: :id]
      "" -> [asc: :id]
      sort_param -> parse_sort_value(sort_param)
    end
  end

  def parse_sort_value(param) do
    case String.starts_with?(param, "-") do
      true ->
        [desc: String.to_atom(String.trim(param, "-"))]

      false ->
        [asc: String.to_atom(param)]
    end
  end

  def parse_where_param(param) do
    case Regex.match?(~r/^\w+\[\w+\]$/, param) do
      true ->
        [prop, constraint] = String.split(param, "[")
        constraint = String.trim(constraint, "]")
        [String.to_atom(prop), constraint]

      false ->
        nil
    end
  end

  def parse_constraint(field, "eq", value) do
    dynamic([r], field(r, ^field) == ^value)
  end

  def parse_constraint(field, "neq", value) do
    dynamic([r], field(r, ^field) != ^value)
  end

  def parse_constraint(field_name, "gt", value) do
    dynamic([r], field(r, ^field_name) > ^value)
  end

  def parse_constraint(field_name, "gte", value) do
    dynamic([r], field(r, ^field_name) > ^value)
  end

  def parse_constraint(field, "lt", value) do
    dynamic([r], field(r, ^field) < ^value)
  end

  def parse_constraint(field, "lte", value) do
    dynamic([r], field(r, ^field) < ^value)
  end

  def parse_constraint(field, "true", _value) do
    dynamic([r], field(r, ^field) == true)
  end

  def parse_constraint(field, "false", _value) do
    dynamic([r], field(r, ^field) == false)
  end

  def parse_constraint(field, "starts_with", value) do
    dynamic([r], ilike(field(r, ^field), ^"%#{value}"))
  end

  def parse_constraint(field, "ends_with", value) do
    dynamic([r], ilike(field(r, ^field), ^"#{value}%"))
  end

  def parse_constraint(field, "in", value) do
    values = String.split(value, ",")
    dynamic([r], field(r, ^field) in ^values)
  end

  def parse_constraint(field, "contains", value) do
    dynamic([r], ilike(field(r, ^field), ^"%#{value}%"))
  end

  def parse_constraint(field, "nil", value) when value in ["true", true] do
    dynamic([r], is_nil(field(r, ^field)))
  end

  def parse_constraint(field, "nil", value) when value in ["false", false] do
    dynamic([r], not is_nil(field(r, ^field)))
  end

  def parse_constraint(_field, constraint, _value) do
    # Here we add an error clause that matches any unknown constraint.
    {:error, "Invalid constraint: #{constraint}"}
  end
end
