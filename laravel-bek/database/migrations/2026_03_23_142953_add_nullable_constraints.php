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
        Schema::table('creators', function (Blueprint $table) {
            $table->unsignedBigInteger('korisnik_id')->nullable(false)->change();
            $table->string('naziv_stranice')->nullable(false)->change();
            // 'opis' ostaje nullable (tako je i zamišljeno)
        });

        Schema::table('sub_levels', function (Blueprint $table) {
            $table->unsignedBigInteger('kreator_id')->nullable(false)->change();
            $table->string('naziv')->nullable(false)->change();
            $table->decimal('cena_mesecno', 8, 2)->nullable(false)->change();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('patron_id')->nullable(false)->change();
            $table->unsignedBigInteger('kreator_id')->nullable(false)->change();
            $table->timestamp('datum_pocetka')->nullable(false)->change();
            $table->string('status')->nullable(false)->change();
            // nivo_id ostaje nullable (dozvoljeno)
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('pretplata_id')->nullable(false)->change();
            $table->decimal('iznos', 8, 2)->nullable(false)->change();
            $table->timestamp('datum')->nullable(false)->change();
            $table->string('status')->nullable(false)->change();
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedBigInteger('kreator_id')->nullable(false)->change();
            $table->string('naslov')->nullable(false)->change();
            $table->text('sadrzaj')->nullable(false)->change();
            $table->timestamp('datum_objave')->nullable(false)->change();
            $table->string('pristup')->nullable(false)->change();
            // nivo_pristupa_id ostaje nullable
        });

        Schema::table('postimages', function (Blueprint $table) {
            $table->unsignedBigInteger('objava_id')->nullable(false)->change();
            $table->string('putanja')->nullable(false)->change();
            $table->integer('redosled')->nullable(false)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         // Vraćanje na nullable stanje (uklanjanje NOT NULL)
        Schema::table('creators', function (Blueprint $table) {
            $table->unsignedBigInteger('korisnik_id')->nullable()->change();
            $table->string('naziv_stranice')->nullable()->change();
        });
        Schema::table('sub_levels', function (Blueprint $table) {
            $table->unsignedBigInteger('kreator_id')->nullable()->change();
            $table->string('naziv')->nullable()->change();
            $table->decimal('cena_mesecno', 8, 2)->nullable()->change();
        });
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unsignedBigInteger('patron_id')->nullable()->change();
            $table->unsignedBigInteger('kreator_id')->nullable()->change();
            $table->timestamp('datum_pocetka')->nullable()->change();
            $table->string('status')->nullable()->change();
        });
        Schema::table('transactions', function (Blueprint $table) {
            $table->unsignedBigInteger('pretplata_id')->nullable()->change();
            $table->decimal('iznos', 8, 2)->nullable()->change();
            $table->timestamp('datum')->nullable()->change();
            $table->string('status')->nullable()->change();
        });
        Schema::table('posts', function (Blueprint $table) {
            $table->unsignedBigInteger('kreator_id')->nullable()->change();
            $table->string('naslov')->nullable()->change();
            $table->text('sadrzaj')->nullable()->change();
            $table->timestamp('datum_objave')->nullable()->change();
            $table->string('pristup')->nullable()->change();
        });
        Schema::table('postimages', function (Blueprint $table) {
            $table->unsignedBigInteger('objava_id')->nullable()->change();
            $table->string('putanja')->nullable()->change();
            $table->integer('redosled')->nullable()->change();
        });
    }
};
