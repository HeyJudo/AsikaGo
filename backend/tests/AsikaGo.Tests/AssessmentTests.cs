using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using AsikaGo.Api.Features.Assessment;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AsikaGo.Tests;

public class AssessmentTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AssessmentTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AssessmentOptions_ReturnsThreeCategories_NoCities()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/assessment/options");
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Expected OK but got {response.StatusCode}. Content: {errorContent}");
        }

        var content = await response.Content.ReadAsStringAsync();
        var options = JsonSerializer.Deserialize<AssessmentOptionsResponse>(
            content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Verify returns the 3 seeded categories, sorted by name
        Assert.NotNull(options);
        Assert.Equal(3, options.Categories.Count);

        // Verify all categories have valid data
        foreach (var c in options.Categories)
        {
            Assert.True(c.Id != Guid.Empty, "Category ID must not be empty");
            Assert.True(!string.IsNullOrEmpty(c.Name), "Category name must not be empty");
            Assert.True(!string.IsNullOrEmpty(c.Description), "Category description must not be empty");
        }

        // Verify sorted by name
        var categoryNames = options.Categories.Select(c => c.Name).ToList();
        for (int i = 1; i < categoryNames.Count; i++)
        {
            Assert.True(string.Compare(categoryNames[i - 1], categoryNames[i], StringComparison.Ordinal) <= 0);
        }

        // Verify businessTypes from confirmed list
        Assert.Equal(new[] { "Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation" }, options.BusinessTypes);

        // Verify registrationStatuses comes from RegistrationStatus enum
        var expectedStatuses = Enum.GetValues<RegistrationStatus>().Select(s => s.ToString()).ToArray();
        Assert.Equal(expectedStatuses, options.RegistrationStatuses);
    }

    [Fact]
    public async Task AssessmentOptions_AnonymousUserCanCall()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/assessment/options");
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Expected OK but got {response.StatusCode}. Content: {errorContent}");
        }
    }

    private const string FoodId = "22222222-2222-2222-2222-222222222201";

    private static string Json(string? name = "Test Business", string type = "Sole Proprietorship",
        string category = FoodId, string? status = "Planning", string extra = "")
    {
        var parts = new List<string>
        {
            $"\"businessType\":\"{type}\"",
            $"\"categoryId\":\"{category}\""
        };
        if (name is not null) parts.Add($"\"businessName\":\"{name}\"");
        if (status is not null) parts.Add($"\"registrationStatus\":\"{status}\"");
        if (extra != "") parts.Add(extra);
        return "{" + string.Join(",", parts) + "}";
    }

    private Task<HttpResponseMessage> Put(Guid user, string json)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User", user.ToString());
        return client.PutAsync("/api/business-profile", new StringContent(json, System.Text.Encoding.UTF8, "application/json"));
    }

    private List<BusinessProfile> Rows(Guid user)
    {
        using var scope = _factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<AppDbContext>()
            .BusinessProfiles.Where(b => b.UserId == user).ToList();
    }

    private static async Task<BusinessProfileResponse> Read(HttpResponseMessage r) =>
        JsonSerializer.Deserialize<BusinessProfileResponse>(await r.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() } })!;

    [Fact]
    public async Task PutBusinessProfile_CreatesProfileWhenNoneExists()
    {
        var user = Guid.NewGuid();
        var response = await Put(user, Json());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var p = await Read(response);
        Assert.NotEqual(default, p.Id);
        Assert.Equal("Test Business", p.BusinessName);
        Assert.Equal("Sole Proprietorship", p.BusinessType);
        Assert.Equal("Pasig", p.CityName);
        Assert.Single(Rows(user));
    }

    [Fact]
    public async Task PutBusinessProfile_SecondCallUpdatesSameRow()
    {
        var user = Guid.NewGuid();
        Assert.Equal(HttpStatusCode.OK, (await Put(user, Json())).StatusCode);
        var second = await Put(user, Json(name: "Renamed", type: "Partnership", status: "Started"));

        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var row = Assert.Single(Rows(user));
        Assert.Equal("Renamed", row.BusinessName);
        Assert.Equal("Partnership", row.BusinessType);
        Assert.Equal(RegistrationStatus.Started, row.RegistrationStatus);
    }

    [Theory]
    [InlineData("type-missing", "businessType")]
    [InlineData("type-bad", "businessType")]
    [InlineData("category", "categoryId")]
    [InlineData("status", "registrationStatus")]
    [InlineData("name", "businessName")]
    public async Task PutBusinessProfile_InvalidField_Returns400UnderThatKey(string which, string key)
    {
        var json = which switch
        {
            "type-missing" => $"{{\"categoryId\":\"{FoodId}\",\"registrationStatus\":\"Planning\"}}",
            "type-bad" => Json(type: "Cooperative"),
            "category" => Json(category: Guid.NewGuid().ToString()),
            "status" => Json(status: null),
            _ => Json(name: new string('a', 101)),
        };
        var response = await Put(Guid.NewGuid(), json);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.True(doc.RootElement.GetProperty("errors").TryGetProperty(key, out _), $"expected error under {key}");
    }

    [Fact]
    public async Task PutBusinessProfile_BusinessNameOmitted_Returns200()
    {
        var response = await Put(Guid.NewGuid(), Json(name: null));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null((await Read(response)).BusinessName);
    }

    [Fact]
    public async Task PutBusinessProfile_OneUserCannotChangeAnother()
    {
        var a = Guid.NewGuid();
        var b = Guid.NewGuid();
        await Put(a, Json(name: "A Shop"));
        await Put(b, Json(name: "B Shop"));
        await Put(a, Json(name: "A Shop 2"));

        Assert.Equal("A Shop 2", Assert.Single(Rows(a)).BusinessName);
        Assert.Equal("B Shop", Assert.Single(Rows(b)).BusinessName);
    }

    [Fact]
    public async Task PutBusinessProfile_CityIdInBodyIsIgnored()
    {
        var response = await Put(Guid.NewGuid(), Json(extra: $"\"cityId\":\"{Guid.NewGuid()}\""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Pasig", (await Read(response)).CityName);
    }
}
