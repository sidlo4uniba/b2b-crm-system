using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.Tovary.Queries.GetTovar;
using CRMBackend.Application.Tovary.Queries.ListTovary;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Plainquire.Filter;
using Plainquire.Page;
using Plainquire.Sort;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TovaryController : ControllerBase
{
    private readonly ISender _sender;

    public TovaryController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] EntityFilter<Tovar> filter,
        [FromQuery] EntitySort<Tovar> sort,
        [FromQuery] EntityPage<Tovar> page,
        [FromQuery] string? search)
    {
        var result = await _sender.Send(new ListTovaryQuery()
        {
            Filter = filter,
            Sort = sort,
            Page = page,
            Search = search
        });
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _sender.Send(new GetTovarQuery() { Id = id });
        return Ok(result);
    }
} 
