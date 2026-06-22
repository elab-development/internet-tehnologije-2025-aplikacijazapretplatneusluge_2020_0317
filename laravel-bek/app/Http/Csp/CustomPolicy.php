<?php

namespace App\Http\Csp;

use Spatie\Csp\Directive;
use Spatie\Csp\Policies\Basic;

class CustomPolicy extends Basic
{
    public function configure()
    {
        parent::configure(); // Ovo uključuje osnovne, sigurne 'self' smernice

        $this->addDirective(Directive::STYLE, 'unsafe-inline')
             ->addDirective(Directive::CONNECT, config('app.frontend_url', 'http://localhost:3000'))
             ->addDirective(Directive::IMG, 'data:');
    }
}