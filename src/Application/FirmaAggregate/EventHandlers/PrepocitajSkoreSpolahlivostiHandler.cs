using CRMBackend.Application.Common.Interfaces.Repositories;
using CRMBackend.Domain.AggregateRoots;
using CRMBackend.Domain.AggregateRoots.FirmaAggregate;
using CRMBackend.Domain.AggregateRoots.ObjednavkaAggregate;
using CRMBackend.Domain.Entities;
using CRMBackend.Domain.Enums;
using CRMBackend.Domain.Events;
using Microsoft.Extensions.Logging;

namespace CRMBackend.Application.Firmy.EventHandlers;

public class PrepocitajSkoreSpolahlivostiHandler : 
    INotificationHandler<ObjednavkaVytvorenaEvent>,
    INotificationHandler<ChybaKlientaZaznamenanaEvent>,
    INotificationHandler<ObjednavkaVybavenaEvent>
{
    private readonly ILogger<PrepocitajSkoreSpolahlivostiHandler> _logger;
    private readonly IWriteRepository<Firma> _firmaWriteRepository;
    private readonly IReadRepository<Objednavka> _objednavkaReadRepository;

    private const decimal PociatocneSkore = 0.70m;
    private const decimal MaxSkore = 1m;
    private const decimal MinSkore = 0m;
    private const decimal PozitivnyBonus = 0.10m;
    private const int MaximumObjednavokNaVypocet = 50;

    public PrepocitajSkoreSpolahlivostiHandler(
        ILogger<PrepocitajSkoreSpolahlivostiHandler> logger,
        IWriteRepository<Firma> firmaWriteRepository,
        IReadRepository<Objednavka> objednavkaReadRepository)
    {
        _logger = logger;
        _firmaWriteRepository = firmaWriteRepository;
        _objednavkaReadRepository = objednavkaReadRepository;
    }

    private static decimal GetHodnotaChyby(ChybaKlienta chyba)
    {
        return chyba switch
        {
            ChybaKlienta.ZrusenaPriVyrobe => 0.2m,
            ChybaKlienta.NezaplatenaNaCas => 0.2m,
            ChybaKlienta.ZlaKomunikacia => 0.05m,
            ChybaKlienta.InyProblem => 0.05m,
            _ => 0m
        };
    }

    private async Task PrepocitajSkore(int firmaId, CancellationToken cancellationToken)
    {
        var firma = await _firmaWriteRepository.GetByIdAsync(firmaId, cancellationToken);

        if (firma == null)
        {
            _logger.LogWarning("Firma s ID {FirmaId} neexistuje", firmaId);
            return;
        }

        var objednavky = await _objednavkaReadRepository
            .GetQueryableNoTracking()
            .Where(o => o.FirmaId == firmaId)
            .OrderByDescending(o => o.VytvoreneDna)
            .Take(MaximumObjednavokNaVypocet)
            .ToListAsync(cancellationToken);

        if (!objednavky.Any())
        {
            firma.UpdateSkoreSpolahlivosti(PociatocneSkore);
            await _firmaWriteRepository.SaveAsync(cancellationToken);
            return;
        }

        decimal skore = PociatocneSkore;

        int uspesneObjednavky = objednavky.Count(o => o.Faza == ObjednavkaFaza.Vybavene);
                
        decimal chybyKlienta = objednavky
            .Where(o => o.ChybaKlienta.HasValue)
            .Sum(o => GetHodnotaChyby(o.ChybaKlienta!.Value));

        skore += uspesneObjednavky * PozitivnyBonus;
        skore -= chybyKlienta;

        skore = Math.Min(MaxSkore, Math.Max(MinSkore, skore));

        firma.UpdateSkoreSpolahlivosti(skore);
        await _firmaWriteRepository.SaveAsync(cancellationToken);
    }

    public async Task Handle(ObjednavkaVytvorenaEvent notification, CancellationToken cancellationToken)
    {
        await PrepocitajSkore(notification.FirmaId, cancellationToken);
    }

    public async Task Handle(ChybaKlientaZaznamenanaEvent notification, CancellationToken cancellationToken)
    {
        await PrepocitajSkore(notification.FirmaId, cancellationToken);
    }

    public async Task Handle(ObjednavkaVybavenaEvent notification, CancellationToken cancellationToken)
    {
        await PrepocitajSkore(notification.FirmaId, cancellationToken);
    }
} 
