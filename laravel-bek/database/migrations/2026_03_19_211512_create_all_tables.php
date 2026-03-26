<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('creators', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('korisnik_id');
            $table->string('naziv_stranice');
            $table->text('opis')->nullable();
            $table->timestamps();
        });

        Schema::create('sub_levels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kreator_id');
            $table->string('naziv');
            $table->decimal('cena_mesecno', 8, 2);
            $table->text('opis')->nullable();
            $table->timestamps();
        });
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patron_id');
            $table->unsignedBigInteger('kreator_id');
            $table->unsignedBigInteger('nivo_id')->nullable();
            $table->timestamp('datum_pocetka')->useCurrent();
            $table->enum('status', ['aktivna', 'otkazana', 'istekla']);
            $table->timestamps();
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pretplata_id');
            $table->decimal('iznos', 8, 2);
            $table->timestamp('datum')->useCurrent();
            $table->enum('status', ['uspesna', 'neuspesna']);
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kreator_id');
            $table->string('naslov');
            $table->text('sadrzaj');
            $table->timestamp('datum_objave')->useCurrent();
            $table->enum('pristup', ['javno', 'pretplatnici', 'nivo']);
            $table->unsignedBigInteger('nivo_pristupa_id')->nullable();
            $table->timestamps();
        });

        Schema::create('postimages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('objava_id');
            $table->string('putanja'); 
            $table->integer('redosled'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creators');
        Schema::dropIfExists('sub_levels');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('postimages');
    }
};
