using Microsoft.AspNetCore.Mvc;
using CRMBackend.Application.ObjednavkaAggregate.Commands.CenovePonuky.PatchCenovaPonuka;
using CRMBackend.Application.ObjednavkaAggregate.Queries.Objednavky.DownloadCenovaPonuka;
using MediatR;
using Microsoft.AspNetCore.Authorization;

namespace CRMBackend.Web.Controllers;

[Authorize]
[ApiController]
[Route("api/objednavky/{objednavkaId}/cenove-ponuky")]
public class ObjednavkyCenovePonukyController : ControllerBase
{
    private readonly ISender _sender;

    public ObjednavkyCenovePonukyController(ISender sender) => _sender = sender;

    [HttpPatch("{ponukaId}")]
    public async Task<IActionResult> Patch(int objednavkaId, int ponukaId, PatchCenovaPonukaCommand command)
    {
        if (command.ObjednavkaId != objednavkaId || command.CenovaPonukaId != ponukaId) 
            return BadRequest("Route IDs do not match command IDs");
        
        await _sender.Send(command);
        return NoContent();
    }
    
    [HttpGet("{ponukaId}/download")]
    public async Task<IActionResult> DownloadCenovaPonuka(int ponukaId)
    {
        var response = await _sender.Send(new DownloadCenovaPonukaQuery { CenovaPonukaId = ponukaId });
        return File(response.FileContents, response.ContentType, response.FileName);
    }
} 
