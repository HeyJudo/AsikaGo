FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props .
COPY src/AsikaGo.Api/AsikaGo.Api.csproj src/AsikaGo.Api/
RUN dotnet restore src/AsikaGo.Api/AsikaGo.Api.csproj

COPY src/AsikaGo.Api/ src/AsikaGo.Api/
RUN dotnet publish src/AsikaGo.Api/AsikaGo.Api.csproj -c Release -o /app --no-restore -p:OpenApiGenerateDocuments=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

ENTRYPOINT ["dotnet", "AsikaGo.Api.dll"]
